/*globals require, module, Promise, console */

'use strict';

var check, walk, events;

check = require('check-types');
walk = require('./walk');
events = require('./events');

module.exports = parse;

/**
 * Public function `parse`.
 *
 * Returns a promise and asynchronously parses a stream of JSON data. If
 * there are no errors, the promise is resolved with the parsed data. If
 * errors occur, the promise is rejected with the first error.
 *
 * @param stream:   Readable instance representing the incoming JSON.
 *
 * @option reviver: Transformation function, invoked depth-first.
 *
 * @option discard: The number of characters to process before discarding
 *                  them to save memory. The default value is `16384`.
 *
 * @option debug:   Log debug messages to the console.
 **/
function parse (stream, options) {
    var reviver, time, emitter, scopes, errors, resolve, reject, key;

    options = options || {};
    reviver = options.reviver;
    if (!options.debug) {
        debug = function () {};
    }
    time = require('./time')(options);

    check.assert.maybe.function(reviver);

    emitter = walk(stream, options);

    scopes = [];
    errors = [];

    emitter.on(events.array, array);
    emitter.on(events.object, object);
    emitter.on(events.property, property);
    emitter.on(events.string, value);
    emitter.on(events.number, value);
    emitter.on(events.literal, value);
    emitter.on(events.endArray, endScope);
    emitter.on(events.endObject, endScope);
    emitter.on(events.end, end);
    emitter.on(events.error, error);

    return new Promise(function (res, rej) {
        resolve = res;
        reject = rej;
    });

    function debug () {
        console.log.apply(console, arguments);
    }

    function array () {
        time.begin('parse::array');
        if (errors.length > 0) {
            time.end('parse::array');
            return;
        }

        debug('array');

        beginScope([]);
        time.end('parse::array');
    }

    function beginScope (parsed) {
        time.begin('parse::beginScope');
        if (errors.length > 0) {
            time.end('parse::beginScope');
            return;
        }

        debug('beginScope: parsed=%s', parsed);

        if (scopes.length > 0) {
            value(parsed);
        }

        scopes.push(parsed);
        time.end('parse::beginScope');
    }

    function value (v) {
        var scope;

        time.begin('parse::value');
        if (errors.length > 0) {
            time.end('parse::value');
            return;
        }

        debug('value: v=`%s`', v);

        if (scopes.length === 0) {
            time.end('parse::value');
            return scopes.push(v);
        }

        scope = scopes[scopes.length - 1];

        if (key) {
            scope[key] = v;
            key = undefined;
        } else {
            scope.push(v);
        }
        time.end('parse::value');
    }

    function object () {
        time.begin('parse::object');
        if (errors.length > 0) {
            time.end('parse::object');
            return;
        }

        debug('object');

        beginScope({});
        time.end('parse::object');
    }

    function property (name) {
        time.begin('parse::property');
        if (errors.length > 0) {
            time.end('parse::property');
            return;
        }

        debug('property: name="%s"', name);

        key = name;
        time.end('parse::property');
    }

    function endScope () {
        time.begin('parse::endScope');
        if (errors.length > 0) {
            time.end('parse::endScope');
            return;
        }

        debug('endScope');

        if (scopes.length > 1) {
            scopes.pop();
        }
        time.end('parse::endScope');
    }

    function end () {
        time.begin('parse::end');
        debug('end: errors.length=%d', errors.length);

        if (errors.length > 0) {
            time.end('parse::end');
            return reject(errors[0]);
        }

        if (reviver) {
            scopes[0] = transform(scopes[0], '');
        }

        resolve(scopes[0]);
        time.end('parse::end');
    }

    function transform (object, key) {
        time.begin('parse::transform');
        if (object && typeof object === 'object') {
            Object.keys(object).forEach(function (childKey) {
                object[childKey] = transform(object[childKey], childKey);
            });
        }

        time.end('parse::transform');
        return reviver(key, object);
    }

    function error (e) {
        time.begin('parse::error');
        debug('error: e={%s}', e.message);

        errors.push(e);
        time.end('parse::error');
    }
}

