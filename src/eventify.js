'use strict'

const check = require('check-types')
const EventEmitter = require('events').EventEmitter
const events = require('./events')

const invalidTypes = {
  undefined: true, // eslint-disable-line no-undefined
  function: true,
  symbol: true
}

module.exports = eventify

/**
 * Public function `eventify`.
 *
 * Returns an event emitter and asynchronously traverses a data structure
 * (depth-first), emitting events as it encounters items. Sanely handles
 * promises, buffers, maps and other iterables.
 *
 * @param data:       The data structure to traverse.
 *
 * @option promises:  'resolve' or 'ignore', default is 'resolve'.
 *
 * @option buffers:   'toString' or 'ignore', default is 'toString'.
 *
 * @option maps:      'object' or 'ignore', default is 'object'.
 *
 * @option iterables:  'array' or 'ignore', default is 'array'.
 *
 * @option circular:   'error' or 'ignore', default is 'error'.
 **/
function eventify (data, options) {
  let ignoreCircularReferences, ignoreItems

  const references = []
  const coercions = {}
  const emitter = new EventEmitter()

  normaliseOptions()
  setImmediate(begin)

  return emitter

  function normaliseOptions () {
    options = options || {}

    normaliseOption('promises')
    normaliseOption('buffers')
    normaliseOption('maps')
    normaliseOption('iterables')

    if (options.circular === 'ignore') {
      ignoreCircularReferences = true
    }
  }

  function normaliseOption (key) {
    if (options[key] !== 'ignore') {
      coercions[key] = true
    }
  }

  function begin () {
    proceed(data).then(after)

    function after () {
      emitter.emit(events.end)
    }
  }

  function proceed (datum) {
    return coerce(datum).then(after)

    function after (coerced) {
      if (isInvalidType(coerced)) {
        return
      }

      if (coerced === false || coerced === true || coerced === null) {
        return literal(coerced)
      }

      const type = typeof coerced

      if (type === 'number') {
        return value(coerced, type)
      }

      if (type === 'string') {
        return value(escapeString(coerced), type)
      }

      if (Array.isArray(coerced)) {
        return array(coerced)
      }

      return object(coerced)
    }
  }

  function coerce (datum) {
    if (check.instanceStrict(datum, Promise)) {
      return coerceThing(datum, 'promises', coercePromise).then(coerce)
    }

    if (check.instanceStrict(datum, Buffer)) {
      return coerceThing(datum, 'buffers', coerceBuffer)
    }

    if (check.instanceStrict(datum, Map)) {
      return coerceThing(datum, 'maps', coerceMap)
    }

    if (
      check.iterable(datum) &&
      check.not.string(datum) &&
      check.not.array(datum)
    ) {
      return coerceThing(datum, 'iterables', coerceIterable)
    }

    if (check.assigned(datum) && check.function(datum.toJSON)) {
      return Promise.resolve(datum.toJSON())
    }

    return Promise.resolve(datum)
  }

  function coerceThing (datum, thing, fn) {
    if (coercions[thing]) {
      return fn(datum)
    }

    return Promise.resolve()
  }

  function coercePromise (promise) {
    return promise.then(result => result)
  }

  function coerceBuffer (buffer) {
    return Promise.resolve(buffer.toString())
  }

  function coerceMap (map) {
    const result = {}

    return coerceCollection(map, result, (item, key) => {
      result[key] = item
    })
  }

  function coerceCollection (coll, target, push) {
    coll.forEach(push)

    return Promise.resolve(target)
  }

  function coerceIterable (iterable) {
    const result = []

    return coerceCollection(iterable, result, item => {
      result.push(item)
    })
  }

  function isInvalidType (datum) {
    return !! invalidTypes[typeof datum]
  }

  function literal (datum) {
    value(datum, 'literal')
  }

  function value (datum, type) {
    emitter.emit(events[type], datum)
  }

  function array (datum) {
    // For an array, collection:object and collection:array are the same.
    return collection(datum, datum, 'array', item => {
      if (isInvalidType(item)) {
        return proceed(null)
      }

      return proceed(item)
    })
  }

  function collection (obj, arr, type, action) {
    let ignoreThisItem, resolve

    if (references.indexOf(obj) >= 0) {
      ignoreThisItem = ignoreItems = true

      if (! ignoreCircularReferences) {
        emitter.emit(events.error, new Error('Circular reference.'))
      }
    } else {
      references.push(obj)
    }

    emitter.emit(events[type])

    setImmediate(item.bind(null, 0))

    return new Promise(res => resolve = res)

    function item (index) {
      if (index >= arr.length) {
        if (ignoreThisItem) {
          ignoreItems = false
        }

        if (ignoreItems) {
          return
        }

        emitter.emit(events.endPrefix + events[type])

        return resolve()
      }

      if (ignoreItems) {
        return item(index + 1)
      }

      action(arr[index]).then(item.bind(null, index + 1))
    }
  }

  function object (datum) {
    // For an object, collection:object and collection:array are different.
    return collection(datum, Object.keys(datum), 'object', key => {
      const item = datum[key]

      if (isInvalidType(item)) {
        return Promise.resolve()
      }

      emitter.emit(events.property, key)

      return proceed(item)
    })
  }

  function escapeString (string) {
    string = JSON.stringify(string)
    return string.substring(1, string.length - 1)
  }
}

