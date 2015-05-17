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
 * @option replacer:  Transformation function, invoked breadth-first,
 *                    or whitelist array of keys to preserve in the
 *                    output.
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
    var replacer, space, stream, emitter, json, indentation,
        awaitPush, isProperty, needsComma;

    normaliseOptions(options || {});

    check.assert.maybe.function(replacer);
    check.assert.maybe.unemptyString(space);

    stream = new JsonStream(read);
    emitter = eventify(data, options);

    json = '';
    indentation = '';
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
        if (check.array(rawOptions.replacer)) {
            replacer = function (key) {
                if (rawOptions.replacer.indexOf(key) !== -1) {
                    return value;
                }
            };
        } else {
            replacer = rawOptions.replacer;
        }

        if (check.positive(rawOptions.space)) {
            space = (new Array(rawOptions.space + 1)).join(' ');
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

        addJson('[');

        // TODO: Migrate to after?
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
        } else if (isScope && space) {
            indentation += space;
        } else {
            needsComma = true;
        }
    }

    function addJson (string, isScopeEnd) {
        if (isScopeEnd && space) {
            indentation = indentation.substr(space.length);
        }

        if (json.length > 0 && space && !isProperty) {
            string = '\n' + indentation + string;
        }

        json += string;
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

        addJson('{');

        // TODO: Migrate to after?
        needsComma = false;

        after();
    }

    function property (name) {
        debug('property: name="%s"', name);

        before();

        addJson('"' + name + '":');
        isProperty = true;

        after();
    }

    function string (s) {
        value('"' + s + '"');
    }

    function value (v) {
        debug('value: v=`%s`', v);

        before();

        addJson(v);

        after();
    }

    function endArray () {
        debug('endArray');

        addJson(']', true);

        after();
    }

    function endObject () {
        debug('endObject');

        addJson('}', true);

        after();
    }

    function end () {
        debug('end');

        after();

        stream.push(null);
    }
}

