/*globals require, module, setImmediate, Promise, Buffer, Map, console */

'use strict';

var check, EventEmitter, error, events;

check = require('check-types');
EventEmitter = require('events').EventEmitter;
error = require('./error');
events = require('./events');

module.exports = eventify;

/**
 * Public function `eventify`.
 *
 * Returns an event emitter and asynchronously traverses a data structure
 * (depth-first), emitting events as it encounters items. Sanely handles
 * promises, buffers, dates, maps and other iterables.
 *
 * @param data:       The data structure to traverse.
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
 **/
function eventify (data, options) {
    var coercions, emitter;

    coercions = {};
    emitter = new EventEmitter();

    normaliseOptions();
    setImmediate(begin);

    return emitter;

    function normaliseOptions () {
        options = options || {};

        normaliseOption('promises');
        normaliseOption('buffers');
        normaliseOption('dates');
        normaliseOption('maps');
        normaliseOption('iterables');
    }

    function normaliseOption (key) {
        if (options[key] !== 'ignore') {
            coercions[key] = true;
        }
    }

    function begin () {
        proceed(data).then(after);

        function after () {
            emitter.emit(events.end);
        }
    }

    function proceed (datum) {
        return coerce(datum).then(after);

        function after (coerced) {
            var type;

            if (coerced === undefined) {
                return;
            }

            if (coerced === false || coerced === true || coerced === null) {
                return literal(coerced);
            }

            type = typeof coerced;

            if (type === 'string' || type === 'number') {
                return value(coerced, type);
            }

            if (Array.isArray(coerced)) {
                return array(coerced);
            }

            return object(coerced);
        }
    }

    function coerce (datum) {
        if (check.instance(datum, Promise)) {
            return coerceThing(datum, 'promises', coercePromise).then(coerce);
        }

        if (check.instance(datum, Buffer)) {
            return coerceThing(datum, 'buffers', coerceBuffer);
        }

        if (check.instance(datum, Date)) {
            return coerceThing(datum, 'dates', coerceDate);
        }

        if (check.instance(datum, Map)) {
            return coerceThing(datum, 'maps', coerceMap);
        }

        if (
            check.iterable(datum) &&
            check.not.string(datum) &&
            check.not.array(datum)
        ) {
            return coerceThing(datum, 'iterables', coerceIterable);
        }

        return Promise.resolve(datum);
    }

    function coerceThing (datum, thing, fn) {
        if (coercions[thing]) {
            return fn(datum);
        }

        return Promise.resolve();
    }

    function coercePromise (promise) {
        return promise.then(function (result) {
            return result;
        });
    }

    function coerceBuffer (buffer) {
        return Promise.resolve(buffer.toString());
    }

    function coerceDate (date) {
        return Promise.resolve(date.toJSON());
    }

    function coerceMap (map) {
        var result = {};

        return coerceCollection(map, result, function (value, key) {
            result[key] = value;
        });
    }

    function coerceCollection (collection, target, push) {
        collection.forEach(push);

        return Promise.resolve(target);
    }

    function coerceIterable (iterable) {
        var result = [];

        return coerceCollection(iterable, result, function (value) {
            result.push(value);
        });
    }

    function literal (datum) {
        value(datum, 'literal');
    }

    function value (datum, type) {
        emitter.emit(events[type], datum);
    }

    function array (datum) {
        return collection(datum, 'array', proceed);
    }

    function collection (c, type, action) {
        var resolve;

        emitter.emit(events[type]);

        setImmediate(item.bind(null, 0));

        return new Promise(function (r) {
            resolve = r;
        });

        function item (index) {
            if (index >= c.length) {
                emitter.emit(events.endPrefix + events[type]);

                return resolve();
            }

            action(c[index]).then(item.bind(null, index + 1));
        }
    }

    function object (datum) {
        return collection(Object.keys(datum), 'object', function (key) {
            emitter.emit(events.property, key);

            return proceed(datum[key]);
        });
    }

    function debug () {
        console.log.apply(console, arguments);
    }
}

