/*globals require, module */

'use strict';

var eventify, events, JsonStream;

eventify = require('./eventify');
events = require('./events');
JsonStream = require('./rstream');

module.exports = streamify;

/**
 * Public function `streamify`.
 *
 * Asynchronously serialises a data structure into a stream of JSON
 * data. Sanely handles promises, buffers, dates, maps and other
 * iterables.
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
function streamify (data, options) {
    var stream, emitter, json, needsComma, isEnded, isProperty;

    // TODO: options.replacer, options.space

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
        if (isEnded && json === '') {
            return stream.push(null);
        }

        stream.push(json, 'utf8');
        json = '';
    }

    function array () {
        begin(true);
        json += '[';
        needsComma = false;
    }

    function begin (isScope) {
        if (isProperty) {
            isProperty = false;
        } else if (needsComma) {
            if (isScope) {
                needsComma = false;
            }

            json += ',';
        } else {
            needsComma = true;
        }
    }

    function object () {
        begin(true);
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

