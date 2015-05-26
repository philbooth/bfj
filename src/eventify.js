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
 *
 * @option debug:     Log debug messages to the console.
 **/
function eventify (data, options) {
    var coercions, emitter, time;

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

        time = require('./time')(options);
    }

    function normaliseOption (key) {
        if (options[key] !== 'ignore') {
            coercions[key] = true;
        }
    }

    function begin () {
        time.begin('eventify::begin');
        debug('begin');

        proceed(data).then(after);

        function after () {
            time.begin('eventify::begin::after');
            debug('begin::after: emitting end');
            emitter.emit(events.end);
            time.end('eventify::begin::after');
        }

        time.end('eventify::begin');
    }

    function proceed (datum) {
        var type;

        time.begin('eventify::proceed');
        debug('proceed:', datum);

        return coerce(datum).then(after);

        function after (coerced) {
            time.begin('eventify::proceed::after');
            debug('proceed::after:', coerced);

            if (coerced === undefined) {
                time.end('eventify::proceed::after');
                return;
            }

            if (coerced === false || coerced === true || coerced === null) {
                time.end('eventify::proceed::after');
                return literal(coerced);
            }

            type = typeof coerced;

            if (type === 'string' || type === 'number') {
                time.end('eventify::proceed::after');
                return value(coerced, type);
            }

            if (Array.isArray(coerced)) {
                time.end('eventify::proceed::after');
                return array(coerced);
            }

            time.end('eventify::proceed::after');
            return object(coerced);
        }
        time.end('eventify::proceed');
    }

    function coerce (datum) {
        time.begin('eventify::coerce');
        if (check.instance(datum, Promise)) {
            time.end('eventify::coerce');
            return coerceThing(datum, 'promises', coercePromise).then(coerce);
        }

        if (check.instance(datum, Buffer)) {
            time.end('eventify::coerce');
            return coerceThing(datum, 'buffers', coerceBuffer);
        }

        if (check.instance(datum, Date)) {
            time.end('eventify::coerce');
            return coerceThing(datum, 'dates', coerceDate);
        }

        if (check.instance(datum, Map)) {
            time.end('eventify::coerce');
            return coerceThing(datum, 'maps', coerceMap);
        }

        if (
            check.iterable(datum) &&
            check.not.string(datum) &&
            check.not.array(datum)
        ) {
            time.end('eventify::coerce');
            return coerceThing(datum, 'iterables', coerceIterable);
        }

        time.end('eventify::coerce');
        return Promise.resolve(datum);
    }

    function coerceThing (datum, thing, fn) {
        time.begin('eventify::coerceThing');
        if (coercions[thing]) {
            time.end('eventify::coerceThing');
            return fn(datum);
        }

        debug('coerceThing(%s): resolving to undefined', thing);

        time.end('eventify::coerceThing');
        return Promise.resolve();
    }

    function coercePromise (promise) {
        time.begin('eventify::coercePromise');
        time.end('eventify::coercePromise');
        return promise.then(function (result) {
            time.begin('eventify::coercePromise::then');
            debug('coercePromise: resolved to `%s`', result);
            time.end('eventify::coercePromise::then');
            return result;
        }).catch(function () {
            time.begin('eventify::coercePromise::catch');
            debug('coercePromise: rejected');
            time.end('eventify::coercePromise::catch');
            return;
        });
    }

    function coerceBuffer (buffer) {
        time.begin('eventify::coerceBuffer');
        var result = buffer.toString();

        debug('coerceBuffer: resolving to `%s`', result);

        time.end('eventify::coerceBuffer');
        return Promise.resolve(result);
    }

    function coerceDate (date) {
        time.begin('eventify::coerceDate');
        var result = date.toJSON();

        debug('coerceDate: resolving to `%s`', result);

        time.end('eventify::coerceDate');
        return Promise.resolve(result);
    }

    function coerceMap (map) {
        time.begin('eventify::coerceMap');
        var result = {};

        time.end('eventify::coerceMap');
        return coerceCollection(map, result, function (value, key) {
            result[key] = value;
        });
    }

    function coerceCollection (collection, target, push) {
        time.begin('eventify::coerceCollection');
        collection.forEach(push);

        debug('coerceCollection: resolving %s[%d]', collection.constructor.name, target.length);

        time.end('eventify::coerceCollection');
        return Promise.resolve(target);
    }

    function coerceIterable (iterable) {
        time.begin('eventify::coerceIterable');
        var result = [];

        time.end('eventify::coerceIterable');
        return coerceCollection(iterable, result, function (value) {
            result.push(value);
        });
    }

    function literal (datum) {
        time.begin('eventify::literal');
        value(datum, 'literal');
        time.end('eventify::literal');
    }

    function value (datum, type) {
        time.begin('eventify::value');
        debug('value: emitting %s `%s`', type, datum);
        emitter.emit(events[type], datum);
        time.end('eventify::value');
    }

    function array (datum) {
        time.begin('eventify::array');
        time.end('eventify::array');
        return collection(datum, 'array', proceed);
    }

    function collection (c, type, action) {
        var resolve;

        time.begin('eventify::collection');
        debug('proceed: emitting %s[%d]', type, c.length);
        emitter.emit(events[type]);

        setImmediate(item.bind(null, 0));

        time.end('eventify::collection');
        return new Promise(function (r) {
            resolve = r;
        });

        function item (index) {
            time.begin('eventify::collection::item');
            if (index >= c.length) {
                debug('proceed::item: emitting end-%s[%d]', type, c.length);
                emitter.emit(events.endPrefix + events[type]);

                time.end('eventify::collection::item');
                return resolve();
            }

            action(c[index]).then(item.bind(null, index + 1));
            time.end('eventify::collection::item');
        }
    }

    function object (datum) {
        time.begin('eventify::object');
        time.end('eventify::object');
        return collection(Object.keys(datum), 'object', function (key) {
            time.begin('eventify::object::action');
            debug('proceed: emitting property `%s`', key);
            emitter.emit(events.property, key);

            time.end('eventify::object::action');
            return proceed(datum[key]);
        });
    }

    function debug () {
        console.log.apply(console, arguments);
    }
}

