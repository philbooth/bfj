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
function streamify (data, options) {
    var space, stream, emitter, json, indentation,
        awaitPush, isProperty, needsComma, time;

    normaliseOptions(options || {});

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
        if (check.positive(rawOptions.space)) {
            space = (new Array(rawOptions.space + 1)).join(' ');
        } else {
            space = rawOptions.space;
        }

        if (!rawOptions.debug) {
            debug = function () {};
        }

        time = require('./time')(rawOptions);
    }

    function debug () {
        console.log.apply(console, arguments);
    }

    function read () {
        time.begin('streamify::read');
        debug('read: awaitPush=%s', awaitPush);

        if (awaitPush) {
            awaitPush = false;
        }
        time.end('streamify::read');
    }

    function array () {
        time.begin('streamify::array');
        debug('array');

        beforeScope();

        json += '[';

        afterScope();
        time.end('streamify::array');
    }

    function beforeScope () {
        time.begin('streamify::beforeScope');
        before(true);
        time.end('streamify::beforeScope');
    }

    function before (isScope) {
        time.begin('streamify::before');
        debug(
            'before: isProperty=%s, needsComma=%s, isScope=%s, indentation=%d',
            isProperty, needsComma, isScope, indentation.length
        );

        if (isProperty) {
            isProperty = false;

            if (space) {
                json += ' ';
            }
        } else {
            if (needsComma) {
                if (isScope) {
                    needsComma = false;
                }

                json += ',';
            } else if (!isScope) {
                needsComma = true;
            }

            if (space && indentation) {
                indent();
            }
        }
        time.end('streamify::before');
    }

    function indent () {
        time.begin('streamify::indent');
        json += '\n' + indentation;
        time.end('streamify::indent');
    }

    function afterScope () {
        time.begin('streamify::afterScope');
        needsComma = false;

        if (space) {
            indentation += space;
        }

        after();
        time.end('streamify::afterScope');
    }

    function after () {
        time.begin('streamify::after');
        debug('after: awaitPush=%s, json=`%s`', awaitPush, json);

        if (awaitPush || json === '') {
            time.end('streamify::after');
            return;
        }

        if (!stream.push(json, 'utf8')) {
            awaitPush = true;
        }

        json = '';
        time.end('streamify::after');
    }

    function object () {
        time.begin('streamify::object');
        debug('object');

        beforeScope();

        json += '{';

        afterScope();
        time.end('streamify::object');
    }

    function property (name) {
        time.begin('streamify::property');
        debug('property: name="%s"', name);

        before();

        json += '"' + name + '":';
        isProperty = true;

        after();
        time.end('streamify::property');
    }

    function string (s) {
        time.begin('streamify::string');
        value('"' + s + '"');
        time.end('streamify::string');
    }

    function value (v) {
        time.begin('streamify::value');
        debug('value: v=`%s`', v);

        before();

        json += v;

        after();
        time.end('streamify::value');
    }

    function endArray () {
        time.begin('streamify::endArray');
        debug('endArray');

        beforeScopeEnd();

        json += ']';

        after();
        time.end('streamify::endArray');
    }

    function beforeScopeEnd () {
        time.begin('streamify::beforeScopeEnd');
        if (space) {
            indentation = indentation.substr(space.length);

            indent();
        }
        time.end('streamify::beforeScopeEnd');
    }

    function endObject () {
        time.begin('streamify::endObject');
        debug('endObject');

        beforeScopeEnd();

        json += '}';

        after();
        time.end('streamify::endObject');
    }

    function end () {
        time.begin('streamify::end');
        debug('end');

        after();

        stream.push(null);
        time.end('streamify::end');
    }
}

