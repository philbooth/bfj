'use strict'

const fs = require('fs')
const parse = require('./parse')

module.exports = read

/**
 * Public function `read`.
 *
 * Returns a promise and asynchronously parses a JSON file read from disk. If
 * there are no errors, the promise is resolved with the parsed data. If errors
 * occur, the promise is rejected with the first error.
 *
 * @param path:   Path to the JSON file.
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
function read (path, options) {
  return parse(fs.createReadStream(path, options), options)
}

