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
 * @param path:       Path to the JSON file.
 *
 * @option reviver:   Transformation function, invoked depth-first.
 *
 * @option yieldRate: The number of data items to process per timeslice,
 *                    default is 16384.
 **/
function read (path, options) {
  try {
    return parse(fs.createReadStream(path, options), options)
  } catch (error) {
    return Promise.reject(error)
  }
}

