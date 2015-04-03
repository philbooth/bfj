/*globals require, module */

'use strict';

var fs, parse;

fs = require('fs');
parse = require('./parse');

module.exports = read;

/**
 * Public function `read`.
 *
 * Asynchronously parses a JSON file read from disk and returns
 * a promise. If there are no errors, the promise is resolved
 * with the parsed data. If errors occur, the promise is rejected
 * with the first error.
 *
 * @param path:     Path to the JSON file.
 *
 * @option delay:   Time in milliseconds to wait between attempts
 *                  to continue after processing has paused. The
 *                  default value is `1000`.
 *
 * @option discard: The number of characters to process before
 *                  discarding the processed characters to save
 *                  memory. The default value is `16384`.
 *
 * @option debug:   Log debug messages to the console.
 **/
function read (path, options) {
    return parse(fs.createReadStream(path), options);
}

