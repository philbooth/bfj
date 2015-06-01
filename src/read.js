/*globals require, module */

'use strict';

var fs, parse;

fs = require('fs');
parse = require('./parse');

module.exports = read;

/**
 * Public function `read`.
 *
 * Returns a promise and asynchronously parses a JSON file read from disk. If
 * there are no errors, the promise is resolved with the parsed data. If errors
 * occur, the promise is rejected with the first error.
 *
 * @param path:     Path to the JSON file.
 *
 * @option reviver: Transformation function, invoked depth-first.
 *
 * @option discard: The number of characters to process before discarding them
 *                  to save memory. The default value is `16384`.
 **/
function read (path, options) {
    return parse(fs.createReadStream(path, options), options);
}

