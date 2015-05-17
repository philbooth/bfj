/*globals require, module, console */

'use strict';

var check, eventify, events, JsonStream;

check = require('check-types');
eventify = require('./eventify');
events = require('./events');
JsonStream = require('./jsonstream');

module.exports = streamify;

/**
 * Public function `streamify`.
 *
 * Asynchronously serialises a data structure to a stream of JSON
 * data. Sanely handles promises, buffers, dates, maps and other
 * iterables.
 *
 * @param data:       The data to transform.
 *
 * @option replacer:  Transformation function or whitelist array of
 *                    keys to preserve in the output.
 *
 * @option space:     Indentation factor.
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
function streamify (data, options) {
    var replacer, space, stream, emitter, json, needsComma, isProperty, awaitPush;

    normaliseOptions(options || {});

    check.assert.function(replacer);
    check.assert.unemptyString(space);

    stream = new JsonStream(read);
    emitter = eventify(data, options);

    json = '';
    awaitPush = true;

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

    function normaliseOptions (rawOptions) {
        if (check.array(rawOptions.replacer) {
            replacer = function (key) {
                if (rawOptions.replacer.indexOf(key) !== -1) {
                    return value;
                }
            };
        } else {
            replacer = rawOptions.replacer;
        }

        if (check.positive(rawOptions.space)) {
            space = Array(rawOptions.space + 1).join(' ');
        } else {
            space = rawOptions.space;
        }

        if (!rawOptions.debug) {
            debug = function () {};
        }
    }

    function debug () {
        console.log.apply(console, arguments);
    }

    function read () {
        debug('read: awaitPush=%s', awaitPush);

        if (awaitPush) {
            awaitPush = false;
        }
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
        } else if (!isScope) {
            needsComma = true;
        }
    }

    function after () {
        debug('after: awaitPush=%s, json=`%s`', awaitPush, json);

        if (awaitPush || json === '') {
            return;
        }

        if (!stream.push(json, 'utf8')) {
            awaitPush = true;
        }

        json = '';
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

        after();
    }

    function endObject () {
        debug('endObject');

        json += '}';

        after();
    }

    function end () {
        debug('end');

        after();

        stream.push(null);
    }
}

