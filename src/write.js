/*globals require, module */

'use strict';

var fs, streamify;

fs = require('fs');
streamify = require('./streamify');

module.exports = write;

/**
 * Public function `write`.
 *
 * Asynchronously serialises a data structure to a JSON file on disk.
 * Sanely handles promises, buffers, dates, maps and other iterables.
 *
 * @param path:       Path to the JSON file.
 *
 * @param data:       The data to transform.
 *
 * @option promises:  'resolve' or 'ignore', default is 'resolve'.
 *
 * @option buffers:   'toString' or 'ignore', default is 'toString'.
 *
 * @option dates:     'toJSON' or 'ignore', default is 'toJSON'.
 *
 * @option maps:      'object', or 'ignore', default is 'object'.
 *
 * @option iterables: 'array', or 'ignore', default is 'array'.
 *
 * @option debug:     Log debug messages to the console.
 **/
function write (path, data, options) {
    return streamify(data, options).pipe(fs.createWriteStream(path, options));
}

