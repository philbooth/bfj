'use strict'

const EventEmitter = require('events').EventEmitter
const check = require('check-types')
const error = require('./error')
const events = require('./events')

const terminators = {
  obj: '}',
  arr: ']'
}

const escapes = {
  /* eslint-disable quote-props */
  '"': '"',
  '\\': '\\',
  '/': '/',
  'b': '\b',
  'f': '\f',
  'n': '\n',
  'r': '\r',
  't': '\t'
  /* eslint-enable quote-props */
}

module.exports = initialise

/**
 * Public function `walk`.
 *
 * Returns an event emitter and asynchronously walks a stream of JSON data,
 * emitting events as it encounters tokens.
 *
 * @param stream:   Readable instance representing the incoming JSON.
 *
 * @option discard: The number of characters to process before discarding
 *          them to save memory. The default value is `16384`.
 **/
function initialise (stream, options) {
  check.assert.instanceStrict(stream, require('stream').Readable, 'Invalid stream argument')

  options = options || {}

  let json = ''
  let index = 0
  let isStreamEnded = false
  let isWalkBegun = false
  let isWalkEnded = false
  let isWalkingString = false
  let resumeFn

  const currentPosition = {
    line: 1,
    column: 1
  }
  const previousPosition = {}
  const scopes = []
  const handlers = {
    arr: value,
    obj: property
  }
  const emitter = new EventEmitter()
  const discardThreshold = options.discard || 16384

  stream.setEncoding('utf8')
  stream.on('data', readStream)
  stream.on('end', endStream)

  return emitter

  function readStream (chunk) {
    json += chunk

    if (!isWalkBegun) {
      isWalkBegun = true
      return value()
    }

    return resume()
  }

  function value () {
    return awaitNonWhitespace()
      .then(next)
      .then(handleValue)
      .catch(() => {})
  }

  function awaitNonWhitespace () {
    return wait()

    function wait () {
      return awaitCharacter()
        .then(step)
    }

    function step () {
      if (isWhitespace(character())) {
        return next().then(wait)
      }
    }
  }

  function awaitCharacter () {
    let resolve, reject

    if (index < json.length) {
      return Promise.resolve()
    }

    if (isStreamEnded) {
      setImmediate(endWalk)
      return Promise.reject(new Error('!!! PHIL !!!'))
    }

    resumeFn = after

    return new Promise((res, rej) => {
      resolve = res
      reject = rej
    })

    function after () {
      if (index < json.length) {
        return resolve()
      }

      reject()

      if (isStreamEnded) {
        setImmediate(endWalk)
      }
    }
  }

  function character () {
    return json[index]
  }

  function next () {
    return awaitCharacter().then(after)

    function after () {
      const result = character()

      index += 1
      previousPosition.line = currentPosition.line
      previousPosition.column = currentPosition.column

      if (result === '\n') {
        currentPosition.line += 1
        currentPosition.column = 1
      } else {
        currentPosition.column += 1
      }

      if (index === discardThreshold) {
        json = json.substring(index)
        index = 0
      }

      return result
    }
  }

  function handleValue (char) {
    switch (char) {
      case '[':
        return array()
      case '{':
        return object()
      case '"':
        return string()
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
      case '-':
      case '.':
        return number(char)
      case 'f':
        return literalFalse()
      case 'n':
        return literalNull()
      case 't':
        return literalTrue()
      default:
        fail(char, 'value', previousPosition)
        return value()
    }
  }

  function array () {
    return scope(events.array, value)
  }

  function scope (event, contentHandler) {
    emitter.emit(event)
    scopes.push(event)
    return endScope(event).then(contentHandler)
  }

  function endScope (scp) {
    let resolve

    awaitNonWhitespace()
      .then(after)
      .catch(endWalk)

    return new Promise(res => resolve = res)

    function after () {
      if (character() !== terminators[scp]) {
        return resolve()
      }

      emitter.emit(events.endPrefix + scp)
      scopes.pop()

      next().then(endValue)
    }
  }

  function endValue () {
    return awaitNonWhitespace()
      .then(after)
      .catch(endWalk)

    function after () {
      if (scopes.length === 0) {
        fail(character(), 'EOF', currentPosition)
        return setImmediate(value)
      }

      return checkScope()
    }

    function checkScope () {
      const scp = scopes[scopes.length - 1]

      return endScope(scp).then(() => {
        const handler = handlers[scp]

        if (checkCharacter(character(), ',', currentPosition)) {
          return next().then(handler)
        }

        return handler()
      })
    }
  }

  function fail (actual, expected, position) {
    emitter.emit(
      events.error,
      error.create(
        actual,
        expected,
        position.line,
        position.column
      )
    )
  }

  function checkCharacter (char, expected, position) {
    if (char !== expected) {
      fail(char, expected, position)
      return false
    }

    return true
  }

  function object () {
    return scope(events.object, property)
  }

  function property () {
    return awaitNonWhitespace()
      .then(next)
      .then(propertyName)
  }

  function propertyName (char) {
    checkCharacter(char, '"', previousPosition)

    return walkString(events.property)
      .then(awaitNonWhitespace)
      .then(next)
      .then(propertyValue)
  }

  function propertyValue (char) {
    checkCharacter(char, ':', previousPosition)
    return value()
  }

  function walkString (event) {
    let isEscaping = false
    let str = ''

    isWalkingString = true

    return next().then(step)

    function step (char) {
      if (isEscaping) {
        isEscaping = false

        return escape(char).then(escaped => {
          str += escaped
          return next().then(step)
        })
      }

      if (char === '\\') {
        isEscaping = true
        return next().then(step)
      }

      if (char !== '"') {
        str += char
        return next().then(step)
      }

      isWalkingString = false
      emitter.emit(event, str)
    }
  }

  function escape (char) {
    if (escapes[char]) {
      return Promise.resolve(escapes[char])
    }

    if (char === 'u') {
      return escapeHex()
    }

    fail(char, 'escape character', previousPosition)
    return Promise.resolve(`\\${char}`)
  }

  function escapeHex () {
    let hexits = ''

    return next().then(step.bind(null, 0))

    function step (idx, char) {
      if (isHexit(char)) {
        hexits += char
      }

      if (idx < 3) {
        return next().then(step.bind(null, idx + 1))
      }

      if (hexits.length === 4) {
        return String.fromCharCode(parseInt(hexits, 16))
      }

      fail(char, 'hex digit', previousPosition)

      return `\\u${hexits}${char}`
    }
  }

  function string () {
    return walkString(events.string).then(endValue)
  }

  function number (firstCharacter) {
    let digits = firstCharacter

    return walkDigits().then(addDigits.bind(null, checkDecimalPlace))

    function addDigits (step, result) {
      digits += result.digits

      if (result.atEnd) {
        return endNumber()
      }

      return step()
    }

    function checkDecimalPlace () {
      if (character() === '.') {
        return next().then(char => {
          digits += char
          walkDigits().then(addDigits.bind(null, checkExponent))
        })
      }

      return checkExponent()
    }

    function checkExponent () {
      if (character() === 'e' || character() === 'E') {
        return next().then(char => {
          digits += char
          awaitCharacter()
            .then(checkSign)
            .catch(fail.bind(null, 'EOF', 'exponent', currentPosition))
        })
      }

      return endNumber()
    }

    function checkSign () {
      if (character() === '+' || character() === '-') {
        return next().then(char => {
          digits += char
          readExponent()
        })
      }

      return readExponent()
    }

    function readExponent () {
      return walkDigits().then(addDigits.bind(null, endNumber))
    }

    function endNumber () {
      emitter.emit(events.number, parseFloat(digits))
      return endValue()
    }
  }

  function walkDigits () {
    let digits = ''

    return wait()

    function wait () {
      return awaitCharacter()
        .then(step)
        .catch(atEnd)
    }

    function step () {
      if (isDigit(character())) {
        return next().then(char => {
          digits += char
          return wait()
        })
      }

      return { digits, atEnd: false }
    }

    function atEnd () {
      return { digits, atEnd: true }
    }
  }

  function literalFalse () {
    return literal([ 'a', 'l', 's', 'e' ], false)
  }

  function literal (expectedCharacters, val) {
    let actual, expected, invalid

    return wait()

    function wait () {
      return awaitCharacter()
        .then(step)
        .catch(atEnd)
    }

    function step () {
      if (invalid || expectedCharacters.length === 0) {
        return atEnd()
      }

      return next().then(afterNext)
    }

    function atEnd () {
      if (invalid) {
        fail(actual, expected, previousPosition)
      } else if (expectedCharacters.length > 0) {
        fail('EOF', expectedCharacters.shift(), currentPosition)
      } else {
        done()
      }

      return endValue()
    }

    function afterNext (char) {
      actual = char
      expected = expectedCharacters.shift()

      if (actual !== expected) {
        invalid = true
      }

      return wait()
    }

    function done () {
      emitter.emit(events.literal, val)
    }
  }

  function literalNull () {
    return literal([ 'u', 'l', 'l' ], null)
  }

  function literalTrue () {
    return literal([ 'r', 'u', 'e' ], true)
  }

  function endStream () {
    isStreamEnded = true

    if (!isWalkBegun) {
      endWalk()
      return
    }

    resume()
  }

  function endWalk () {
    if (isWalkEnded) {
      return
    }

    isWalkEnded = true

    if (isWalkingString) {
      fail('EOF', '"', currentPosition)
    }

    while (scopes.length > 0) {
      fail('EOF', terminators[scopes.pop()], currentPosition)
    }

    emitter.emit(events.end)
  }

  function resume () {
    if (resumeFn) {
      resumeFn()
      resumeFn = null
    }
  }
}

function isWhitespace (character) {
  switch (character) {
    case ' ':
    case '\t':
    case '\r':
    case '\n':
      return true
  }

  return false
}

function isHexit (character) {
  return isDigit(character) ||
    isInRange(character, 'A', 'F') ||
    isInRange(character, 'a', 'f')
}

function isDigit (character) {
  return isInRange(character, '0', '9')
}

function isInRange (character, lower, upper) {
  const code = character.charCodeAt(0)

  return code >= lower.charCodeAt(0) && code <= upper.charCodeAt(0)
}

