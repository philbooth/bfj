'use strict'

const stream = require('stream')
const check = require('check-types')
const parse = require('./parse')

module.exports = unpipe

/**
 * Public function `unpipe`.
 *
 * Returns a writeable stream that can be passed to stream.pipe, then parses JSON
 * data read from the stream. If there are no errors, the callback is invoked with
 * the result as the second argument. If errors occur, the first error is passed to
 * the callback as the first argument.
 *
 * @param callback: Function that will be called after parsing is complete.
 *
 * @option reviver: Transformation function, invoked depth-first.
 *
 * @option size: The number of characters to keep in memory. Higher values use more
 *               memory, lower values increase the chance of failure due to chunk
 *               size exceeding available space. The default value is `1048576`.
 *
 * @option grow: Boolean indicating whether to grow memory automatically when an
 *               incoming chunk exceeds the amount of available space. Introduces
 *               the possibility of out-of-memory exceptions and may slow down
 *               parsing. The default value is `false`.
 **/
function unpipe (callback, options) {
  check.assert.function(callback, 'Invalid callback argument')

  const jsonstream = new stream.PassThrough()

  parse(jsonstream, options)
    .then(data => callback(null, data))
    .catch(error => callback(error))

  return jsonstream
}

