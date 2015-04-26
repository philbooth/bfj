/*globals require, module, setImmediate, Promise, Map, Symbol, setTimeout, console */

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
    var coercions, context, emitter;

    coercions = {};
    context = [];
    emitter = new EventEmitter();

    normaliseOptions();
    setImmediate(proceed.bind(null, data));

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
            coercions[key] = true;
        }
    }

    function proceed (datum) {
        var type;

        datum = coerce(datum);

        if (datum === undefined) {
            return;
        }

        if (datum === false || datum === true || datum === null) {
            emitter.emit(events.literal, datum);
            return;
        }

        type = typeof datum;

        if (type === 'string' || type === 'number') {
            emitter.emit(events[type], datum);
            return;
        }

        context.push(datum);

        if (Array.isArray(datum)) {
            emitter.emit(events.array);
            datum.forEach(proceed);
        } else {
            emitter.emit(events.object);
            Object.keys(datum).forEach(function (key) {
                proceed(datum[key]);
            });
        }

        context.pop();
        return;
    }

    function coerce (datum) {
        if (datum instanceof Promise) {
            return coerceThing(datum, 'promises', coercePromise);
        }

        if (datum instanceof Date) {
            return coerceThing(datum, 'dates', coerceDate);
        }

        if (datum instanceof Map) {
            return coerceThing(datum, 'maps', coerceMap);
        }

        if (typeof datum[Symbol.iterator] === 'function') {
            return coerceThing(datum, 'iterables', coerceIterable);
        }

        return datum;
    }

    function coerceThing (datum, thing, fn) {
        if (coercions[thing]) {
            return fn(datum);
        }

        return undefined;
    }

    function coercePromise (promise) {
        var result, done;

        promise.then(function (r) {
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

    function coerceDate (date) {
        return date.toJSON();
    }

    function coerceMap (map) {
        var result = {};

        map.forEach(function (value, key) {
            result[key] = value;
        });

        return result;
    }

    function coerceIterable (iterable) {
        return Array.from(iterable);
    }
}

function debug () {
    console.log.apply(console, arguments);
}

