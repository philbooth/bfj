/*globals require, module */

'use strict';

var eventify, events;

eventify = require('./eventify');
events = require('./events');

module.exports = streamify;

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
    var stream, emitter, json, isBegun, isEnded, isProperty;

    // TODO: options.buffers, options.replacer, options.space

    stream = new JsonStream(push);
    emitter = eventify(data, options);
    json = '';

    emitter.on(events.array, array);
    emitter.on(events.object, object);
    emitter.on(events.property, property);
    emitter.on(events.string, string);
    emitter.on(events.number, value);
    emitter.on(events.literal, value);
    emitter.on(events.endArray, endArray);
    emitter.on(events.endObject, endObject);
    emitter.on(events.end, end);

    return stream;

    function push () {
        if (isEnded) {
            return stream.push(null);
        }

        stream.push(json, 'utf8');
        json = '';
    }

    function array () {
        begin();
        json += '[';
    }

    function begin () {
        if (isBegun) {
            if (isProperty) {
                isProperty = false;
            } else {
                json += ',';
            }
        } else {
            isBegun = true;
        }
    }

    function object () {
        begin();
        json += '{';
    }

    function property (name) {
        begin();
        json += '"' + name + '":';
        isProperty = true;
    }

    function string (s) {
        value('"' + s + '"');
    }

    function value (v) {
        begin();
        json += v;
    }

    function endArray () {
        json += ']';
    }

    function endObject () {
        json += '}';
    }

    function end () {
        isEnded = true;
    }
}

// HACK: What follows is only here temporarily, until #5 is resolved.
var util, Readable, check;

util = require('util');
Readable = require('stream').Readable;
check = require('check-types');

util.inherits(JsonStream, Readable);

function JsonStream (read) {
    // https://nodejs.org/api/stream.html#stream_class_stream_readable_1

    if (check.not.instance(this, JsonStream)) {
        return new JsonStream(read);
    }

    check.assert.function(read, 'Invalid read implementation');

    this._read = function () {
        // TODO: Check it is okay to ignore size argument

        read();
    };

    return Readable.call(this, { encoding: 'utf8' });
}

