/*globals require, module, Promise */

'use strict';

var check, streamify;

check = require('check-types');
streamify = require('./streamify');

module.exports = stringify;

/**
 * Public function `stringify`.
 *
 * Returns a promise and asynchronously serialises a data structure to a
 * JSON string. Sanely handles promises, buffers, dates, maps and other
 * iterables.
 *
 * @param data:       The data to transform
 *
 * @option replacer:  Transformation function, invoked breadth-first,
 *                    or whitelist array of keys to preserve in the
 *                    output.
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
 * @option maps:      'object', or 'ignore', default is 'object'.
 *
 * @option iterables: 'array', or 'ignore', default is 'array'.
 *
 * @option debug:     Log debug messages to the console.
 **/
function stringify (data, options) {
    var replacer, stream, json, resolve;

    normaliseOptions(options || {});

    check.assert.maybe.function(replacer);

    stream = streamify(data, options);
    json = '';

    stream.on('data', read);
    stream.on('end', end);

    return new Promise(function (res) {
        resolve = res;
    });

    function normaliseOptions (rawOptions) {
        if (check.array(rawOptions.replacer)) {
            replacer = function (key, value) {
                if (rawOptions.replacer.indexOf(key) !== -1) {
                    return value;
                }
            };
        } else {
            replacer = rawOptions.replacer;
        }
    }

    function read (chunk) {
        json += chunk;
    }

    function end () {
        resolve(json);
    }
}

