/*globals require, module, setImmediate, Promise, Map, Symbol, console */

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
 * Asynchronously traverses a data structure (depth-first) and returns an
 * EventEmitter instance, emitting events as it encounters data. Sanely
 * handles promises, dates, maps and other iterables.
 *
 * @param data:        The data structure to traverse.
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
function eventify (data, options) {
    var coercions, emitter;

    // TODO: options.buffers, options.reviver

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

        if (!options.debug) {
            debug = function () {};
        }
    }

    function normaliseOption (key) {
        if (options[key] !== 'ignore') {
            coercions[key] = true;
        }
    }

    function begin () {
        debug('begin');

        proceed(data).then(after);

        function after () {
            debug('begin::after: emitting end');
            emitter.emit(events.end);
        }
    }

    function proceed (datum) {
        var type;

        debug('proceed:', datum);

        return coerce(datum).then(after);

        function after (coerced) {
            debug('proceed::after:', coerced);

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

        debug('coerceThing(%s): resolving to undefined', thing);

        return Promise.resolve();
    }

    function coercePromise (promise) {
        return promise.then(function (result) {
            debug('coercePromise: resolved to `%s`', result);
            return result;
        }).catch(function () {
            debug('coercePromise: rejected');
            return;
        });
    }

    function coerceBuffer (buffer) {
        var result = buffer.toString();

        debug('coerceBuffer: resolving to `%s`', result);

        return Promise.resolve(result);
    }

    function coerceDate (date) {
        var result = date.toJSON();

        debug('coerceDate: resolving to `%s`', result);

        return Promise.resolve(result);
    }

    function coerceMap (map) {
        var result = {};

        return coerceCollection(map, result, function (value, key) {
            result[key] = value;
        });
    }

    function coerceCollection (collection, target, push) {
        collection.forEach(push);

        debug('coerceCollection: resolving %s[%d]', collection.constructor.name, target.length);

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
        debug('value: emitting %s `%s`', type, datum);
        emitter.emit(events[type], datum);
    }

    function array (datum) {
        return collection(datum, 'array', proceed);
    }

    function collection (c, type, action) {
        var resolve;

        debug('proceed: emitting %s[%d]', type, c.length);
        emitter.emit(events[type]);

        setImmediate(item.bind(null, 0));

        return new Promise(function (r) {
            resolve = r;
        });

        function item (index) {
            if (index >= c.length) {
                debug('proceed::item: emitting end-%s[%d]', type, c.length);
                emitter.emit(events.endPrefix + events[type]);

                return resolve();
            }

            action(c[index]).then(item.bind(null, index + 1));
        }
    }

    function object (datum) {
        return collection(Object.keys(datum), 'object', function (key) {
            debug('proceed: emitting property `%s`', key);
            emitter.emit(events.property, key);

            return proceed(datum[key]);
        });
    }

    function debug () {
        console.log.apply(console, arguments);
    }
}

