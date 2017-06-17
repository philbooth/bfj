'use strict'

const check = require('check-types')
const eventify = require('./eventify')
const events = require('./events')
const JsonStream = require('./jsonstream')

const BUFFER_SIZE = 65536

module.exports = streamify

/**
 * Public function `streamify`.
 *
 * Asynchronously serialises a data structure to a stream of JSON
 * data. Sanely handles promises, buffers, maps and other iterables.
 *
 * @param data:       The data to transform.
 *
 * @option space:     Indentation string, or the number of spaces
 *                    to indent each nested level by.
 *
 * @option promises:  'resolve' or 'ignore', default is 'resolve'.
 *
 * @option buffers:   'toString' or 'ignore', default is 'toString'.
 *
 * @option maps:      'object' or 'ignore', default is 'object'.
 *
 * @option iterables: 'array' or 'ignore', default is 'array'.
 *
 * @option circular:  'error' or 'ignore', default is 'error'.
 *
 * @option yieldRate:  The number of data items to process per timeslice,
 *                     default is 16384.
 **/
function streamify (data, options) {
  let isProperty, needsComma, isEnded

  const space = normaliseSpace(options || {})

  const stream = new JsonStream(read)
  const emitter = eventify(data, options)

  let json = new Array(BUFFER_SIZE)
  let length = 0
  let index = 0
  let indentation = ''
  let awaitPush = true

  emitter.on(events.array, array)
  emitter.on(events.object, object)
  emitter.on(events.property, property)
  emitter.on(events.string, string)
  emitter.on(events.number, value)
  emitter.on(events.literal, value)
  emitter.on(events.endArray, endArray)
  emitter.on(events.endObject, endObject)
  emitter.on(events.end, end)
  emitter.on(events.error, error)

  return stream

  function read () {
    if (awaitPush) {
      awaitPush = false

      if (isEnded) {
        if (length > 0) {
          after()
        }

        endStream()
      }
    }
  }

  function endStream () {
    if (!awaitPush) {
      stream.push(null)
    }
  }

  function array () {
    beforeScope()

    addJson('[')

    afterScope()
  }

  function addJson (chunk) {
    if (length + 1 > json.length) {
      const embiggened = new Array(json.length + BUFFER_SIZE)
      for (let i = 0; i < length; ++i) {
        embiggened[i] = json[(index + i) % json.length]
      }
      json = embiggened
      index = 0
    }

    json[(index + length++) % json.length] = chunk
  }

  function beforeScope () {
    before(true)
  }

  function before (isScope) {
    if (isProperty) {
      isProperty = false

      if (space) {
        addJson(' ')
      }
    } else {
      if (needsComma) {
        if (isScope) {
          needsComma = false
        }

        addJson(',')
      } else if (!isScope) {
        needsComma = true
      }

      if (space && indentation) {
        indent()
      }
    }
  }

  function indent () {
    addJson(`\n${indentation}`)
  }

  function afterScope () {
    needsComma = false

    if (space) {
      indentation += space
    }

    after()
  }

  function after () {
    if (awaitPush) {
      return
    }

    let i

    for (i = 0; i < length && ! awaitPush; ++i) {
      if (! stream.push(json[(i + index) % json.length], 'utf8')) {
        awaitPush = true
      }
    }

    if (i === length) {
      index = length = 0
    } else {
      length -= i
      index += i
    }
  }

  function object () {
    beforeScope()

    addJson('{')

    afterScope()
  }

  function property (name) {
    before()

    addJson(`"${name}":`)

    isProperty = true

    after()
  }

  function string (s) {
    value(`"${s}"`)
  }

  function value (v) {
    before()

    addJson(`${v}`)

    after()
  }

  function endArray () {
    beforeScopeEnd()

    addJson(']')

    afterScopeEnd()
  }

  function beforeScopeEnd () {
    if (space) {
      indentation = indentation.substr(space.length)

      indent()
    }
  }

  function afterScopeEnd () {
    needsComma = true
    after()
  }

  function endObject () {
    beforeScopeEnd()

    addJson('}')

    afterScopeEnd()
  }

  function end () {
    after()

    isEnded = true
    endStream()
  }

  function error (err) {
    stream.emit('dataError', err)
  }
}

function normaliseSpace (options) {
  if (check.positive(options.space)) {
    return new Array(options.space + 1).join(' ')
  }

  if (check.nonEmptyString(options.space)) {
    return options.space
  }
}

