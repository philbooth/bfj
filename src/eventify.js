/*globals require, module, setImmediate, Promise, console */

'use strict';

var EventEmitter, error, events;

EventEmitter = require('events').EventEmitter;
error = require('./error');
events = require('./events');

module.exports = eventify;

/**
 * Public function `eventify`.
 *
 * Asynchronously traverses a data structure (depth-first) and returns an
 * EventEmitter instance, emitting events as it encounters data. Sanely
 * handles promises, dates, maps and other iterables.
 *
 * @param data:        The data structure to traverse.
 *
 * @option apply:      Dictionary of {function name:argument array} pairs.
 *                     When functions are encountered in the data, this
 *                     object is checked for keys that match the function
 *                     name. If a match exists, the function is applied
 *                     using the associated argument array and an event is
 *                     emitted for the result. If no match exists or this
 *                     option is not specified, the function is ignored.
 *                   
 * @option promises:   'resolve' or 'ignore', default is 'resolve'.
 *
 * @option poll:       Promise resolution polling period in milliseconds,
 *                     default is 1000.
 *
 * @option dates:      'toJSON' or 'ignore', default is 'toJSON'.
 *
 * @option maps:       'object', or 'ignore', default is 'object'.
 *
 * @option iterables:  'array', or 'ignore', default is 'array'.
 *
 * @option debug:      Log debug messages to the console.
 **/
function eventify (data, options) {
    var coerce, context, emitter, current;

    coerce = {};
    context = [];
    emitter = new EventEmitter();

    normaliseOptions();
    setImmediate(begin);

    return emitter;

    function normaliseOptions () {
        options = options || {};
        options.apply = options.apply || {};
        options.poll = options.poll || 1000;

        normaliseOption('promises');
        normaliseOption('dates');
        normaliseOption('maps');
        normaliseOption('iterables');

        if (!options.debug) {
            debug = function () {};
        }
    }

    function normaliseOption (key) {
        if (options[key] !== 'ignore') {
            coerce[key] = true;
        }
    }

    function begin () {
        current = data;
        proceed();
    }

    function proceed () {
        if (current) {
            context.push(current);
        }

        current = coerce(data);

        if (current === undefined) {
            return;
        }

        if (current === false || current === true || current === null) {
            emitter.emit(events.literal, current);
            return;
        }

        type = typeof current;

        if (type === 'string' || type === 'number') {
            emitter.emit(events[type], current);
            return;
        }

        if (Array.isArray(current)) {
            emitter.emit(events.array);
            // recur for items
            return;
        }

        emitter.emit(events.object);
        // recur for items
        return;
    }

    function coerce () {
        if (current instanceof Promise) {
            return coerceThing('promises', coercePromise);
        }

        if (current instanceof Date) {
            return coerceThing('dates', coerceDate);
        }

        if (current instanceof Map) {
            return coerceThing('maps', coerceMap);
        }

        if (typeof current[Symbol.iterator] === 'function') {
            return coerceThing('iterables', coerceIterable);
        }

        return current;
    }

    function coerceThing (thing, fn) {
        if (coerce[thing]) {
            return fn();
        }

        return undefined;
    }

    function coercePromise () {
        var result;

        current.then(function (r) {
            result = r;
            done = true;
        }).catch(function () {
            done = true;
        });

        while (!done) {
            setTimeout(function () {}, options.poll);
        }

        return result;
    }

    function coerceDate () {
        return current.toJSON();
    }

    function coerceMap () {
        var result = {};

        current.forEach(function (value, key) {
            result[key] = value;
        });

        return result;
    }

    function coerceIterable () {
        return Array.from(current);
    }
}

