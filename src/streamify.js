/*globals require, module */

'use strict';

var eventify, events;

eventify = require('./eventify');
events = require('./events');

/**
 * Public function `streamify`.
 *
 * Asynchronously serialises a data structure into a stream of JSON
 * data. Sanely handles promises, dates, maps and other iterables.
 *
 * @param data:        The data to transform
 *
 * @option promises:   'resolve' or 'ignore', default is 'resolve'.
 *
 * @option dates:      'toJSON' or 'ignore', default is 'toJSON'.
 *
 * @option maps:       'object', or 'ignore', default is 'object'.
 *
 * @option iterables:  'array', or 'ignore', default is 'array'.
 *
 * @option debug:      Log debug messages to the console.
 **/

function streamify (data, options) {
    var stream, emitter;

    stream = /* TODO: Instantiate readable stream */;
    emitter = eventify(data, options);
}

