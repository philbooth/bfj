/*globals require, module, Promise, console */

'use strict';

var walk, events;

walk = require('./walk');
events = require('./events');

module.exports = parse;

/**
 * Public function `parse`.
 *
 * Asynchronously parses a Readable instance as JSON and returns
 * a promise. If there are no errors, the promise is resolved
 * with the parsed data. If errors occur, the promise is rejected
 * with the first error.
 *
 * @param stream:   Readable stream representing the incoming JSON.
 *
 * @option discard: The number of characters to process before
 *                  discarding the processed characters to save
 *                  memory. The default value is `16384`.
 *
 * @option debug:   Log debug messages to the console.
 **/
function parse (stream, options) {
    var walker, scopes, errors, resolve, reject, key;

    walker = walk(options);
    stream.pipe(walker.stream);

    options = options || {};
    scopes = [];
    errors = [];

    if (!options.debug) {
        debug = function () {};
    }

    walker.emitter.on(events.array, array);
    walker.emitter.on(events.object, object);
    walker.emitter.on(events.property, property);
    walker.emitter.on(events.string, value);
    walker.emitter.on(events.number, value);
    walker.emitter.on(events.literal, value);
    walker.emitter.on(events.endArray, endScope);
    walker.emitter.on(events.endObject, endScope);
    walker.emitter.on(events.end, end);
    walker.emitter.on(events.error, error);

    return new Promise(function (res, rej) {
        resolve = res;
        reject = rej;
    });

    function debug (message) {
        console.log(message);
    }

    function array () {
        debug('array');

        beginScope([]);
    }

    function beginScope (parsed) {
        debug('beginScope: parsed=' + parsed);

        if (scopes.length > 0) {
            value(parsed);
        }

        scopes.push(parsed);
    }

    function value (v) {
        debug('value: v=' + v);

        var scope = scopes[scopes.length - 1];

        if (key) {
            scope[key] = v;
            key = undefined;
        } else {
            scope.push(v);
        }
    }

    function object () {
        debug('object');

        beginScope({});
    }

    function property (name) {
        debug('property: name=' + name);

        key = name;
    }

    function endScope () {
        debug('endScope');

        scopes.pop();
    }

    function end () {
        debug('end: errors.length=' + errors.length);

        if (errors.length > 0) {
            return reject(errors[0]);
        }

        resolve(scopes[0]);
    }

    function error (e) {
        debug('error: e=' + e);

        errors.push(e);
    }
}

