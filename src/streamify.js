/*globals require, module, console */

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
    var stream, emitter, json, needsComma, isEnded, isProperty, awaitPush;

    // TODO: options.replacer, options.space

    stream = new JsonStream(push);
    emitter = eventify(data, options);

    options = options || {};
    json = '';
    awaitPush = true;

    if (!options.debug) {
        debug = function () {};
    }

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

    function debug () {
        console.log.apply(console, arguments);
    }

    function push () {
        debug('push: awaitPush=%s, isEnded=%s, json=`%s`', awaitPush, isEnded, json);

        if (awaitPush) {
            awaitPush = false;
        }

        if (json === '') {
            if (isEnded) {
                return stream.push(null);
            }

            return;
        }

        if (!stream.push(json, 'utf8')) {
            awaitPush = true;
        }

        json = '';
    }

    function array () {
        debug('array');

        before(true);

        json += '[';
        needsComma = false;

        after();
    }

    function before (isScope) {
        debug(
            'before: isProperty=%s, needsComma=%s, isScope=%s',
            isProperty, needsComma, isScope
        );

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

    function after () {
        debug('after: awaitPush=%s', awaitPush);

        if (!awaitPush) {
            push();
        }
    }

    function object () {
        debug('object');

        before(true);

        json += '{';

        after();
    }

    function property (name) {
        debug('property: name="%s"', name);

        before();

        json += '"' + name + '":';
        isProperty = true;

        after();
    }

    function string (s) {
        value('"' + s + '"');
    }

    function value (v) {
        debug('value: v=`%s`', v);

        before();

        json += v;

        after();
    }

    function endArray () {
        debug('endArray');

        json += ']';
    }

    function endObject () {
        debug('endObject');

        json += '}';
    }

    function end () {
        debug('end');

        isEnded = true;
    }
}

