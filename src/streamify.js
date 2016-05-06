'use strict'

const check = require('check-types')
const eventify = require('./eventify')
const events = require('./events')
const JsonStream = require('./jsonstream')

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
 **/
function streamify (data, options) {
  let isProperty, needsComma, isEnded

  const space = normaliseSpace(options || {})

  const stream = new JsonStream(read)
  const emitter = eventify(data, options)

  let json = ''
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
        if (json !== '') {
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

    json += '['

    afterScope()
  }

  function beforeScope () {
    before(true)
  }

  function before (isScope) {
    if (isProperty) {
      isProperty = false

      if (space) {
        json += ' '
      }
    } else {
      if (needsComma) {
        if (isScope) {
          needsComma = false
        }

        json += ','
      } else if (!isScope) {
        needsComma = true
      }

      if (space && indentation) {
        indent()
      }
    }
  }

  function indent () {
    json += `\n${indentation}`
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

    if (!stream.push(json, 'utf8')) {
      awaitPush = true
    }

    json = ''
  }

  function object () {
    beforeScope()

    json += '{'

    afterScope()
  }

  function property (name) {
    before()

    json += `"${name}":`
    isProperty = true

    after()
  }

  function string (s) {
    value(`"${s}"`)
  }

  function value (v) {
    before()

    json += v

    after()
  }

  function endArray () {
    beforeScopeEnd()

    json += ']'

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

    json += '}'

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

