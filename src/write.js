/*globals require, module, Promise */

'use strict';

var fs, streamify;

fs = require('fs');
streamify = require('./streamify');

module.exports = write;

/**
 * Public function `write`.
 *
 * Returns a promise and asynchronously serialises a data structure to a
 * JSON file on disk. Sanely handles promises, buffers, dates, maps and
 * other iterables.
 *
 * @param path:       Path to the JSON file.
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
 * @option dates:     'toJSON' or 'ignore', default is 'toJSON'.
 *
 * @option maps:      'object' or 'ignore', default is 'object'.
 *
 * @option iterables: 'array' or 'ignore', default is 'array'.
 *
 * @option circular:  'error' or 'ignore', default is 'error'.
 **/
function write (path, data, options) {
    return new Promise(function (resolve, reject) {
        streamify(data, options)
            .pipe(fs.createWriteStream(path, options))
            .on('finish', function () {
                resolve();
            })
            .on('error', reject)
            .on('dataError', reject);
    });
}

