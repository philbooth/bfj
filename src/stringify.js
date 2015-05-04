/*globals require, module, Promise */

'use strict';

var streamify;

streamify = require('./streamify');

module.exports = stringify;

/**
 * Public function `stringify`.
 *
 * Asynchronously serialises a data structure and returns a promise
 * that resolves to a JSON string. Sanely handles promises, buffers,
 * dates, maps and other iterables.
 *
 * @param data:        The data to transform
 *
 * @option promises:   'resolve' or 'ignore', default is 'resolve'.
 *
 * @option buffers:    'toString' or 'ignore', default is 'toString'.
 *
 * @option dates:      'toJSON' or 'ignore', default is 'toJSON'.
 *
 * @option maps:       'object', or 'ignore', default is 'object'.
 *
 * @option iterables:  'array', or 'ignore', default is 'array'.
 *
 * @option debug:      Log debug messages to the console.
 **/
function stringify (data, options) {
    var stream, json, resolve;

    // TODO: options.replacer, options.space

    stream = streamify(data, options);
    json = '';

    stream.setEncoding('utf8');
    stream.on('data', read);
    stream.on('end', end);

    return new Promise(function (res) {
        resolve = res;
    });

    function read (chunk) {
        json += chunk;
    }

    function end () {
        resolve(json);
    }
}

