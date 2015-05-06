/*globals require, module, Promise, console */

'use strict';

var walk, events;

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
    var emitter, scopes, errors, reviver, resolve, reject, key;

    check.assert.maybe.function(options.reviver);

    emitter = walk(stream, options);

    options = options || {};
    scopes = [];
    errors = [];

    reviver = options.reviver;
    if (!options.debug) {
        debug = function () {};
    }

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
        if (errors.length > 0) {
            return;
        }

        debug('array');

        beginScope([]);
    }

    function beginScope (parsed) {
        if (errors.length > 0) {
            return;
        }

        debug('beginScope: parsed=%s', parsed);

        if (scopes.length > 0) {
            value(parsed);
        }

        scopes.push(parsed);
    }

    function value (v) {
        var scope;

        if (errors.length > 0) {
            return;
        }

        debug('value: v=`%s`', v);

        if (scopes.length === 0) {
            return scopes.push(v);
        }

        scope = scopes[scopes.length - 1];

        if (key) {
            scope[key] = v;
            key = undefined;
        } else {
            scope.push(v);
        }
    }

    function object () {
        if (errors.length > 0) {
            return;
        }

        debug('object');

        beginScope({});
    }

    function property (name) {
        if (errors.length > 0) {
            return;
        }

        debug('property: name="%s"', name);

        key = name;
    }

    function endScope () {
        if (errors.length > 0) {
            return;
        }

        debug('endScope');

        if (scopes.length > 1) {
            scopes.pop();
        }
    }

    function end () {
        debug('end: errors.length=%d', errors.length);

        if (errors.length > 0) {
            return reject(errors[0]);
        }

        if (reviver) {
            scopes[0] = transform(scopes[0], '');
        }

        resolve(scopes[0]);
    }

    function transform (object, key) {
        if (object && typeof object === 'object') {
            Object.keys(object).forEach(function (key) {
                object[key] = transform(object, key);
            });
        }

        return reviver(key, object);
    }

    function error (e) {
        debug('error: e={%s}', e.message);

        errors.push(e);
    }
}

