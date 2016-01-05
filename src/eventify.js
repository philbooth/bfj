/*globals require, module, setImmediate, Promise, Buffer, Map */

'use strict';

var check, EventEmitter, events, invalidTypes;

check = require('check-types');
EventEmitter = require('events').EventEmitter;
events = require('./events');

invalidTypes = {
    'undefined': true,
    'function': true,
    'symbol': true
};

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
 * @option maps:      'object' or 'ignore', default is 'object'.
 *
 * @option iterables: 'array' or 'ignore', default is 'array'.
 *
 * @option circular:  'error' or 'ignore', default is 'error'.
 **/
function eventify (data, options) {
    var references, coercions, emitter, ignoreCircularReferences, ignoreItems;

    references = [];
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

        if (options.circular === 'ignore') {
            ignoreCircularReferences = true;
        }
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

            if (isInvalidType(coerced)) {
                return;
            }

            if (coerced === false || coerced === true || coerced === null) {
                return literal(coerced);
            }

            type = typeof coerced;

            if (type === 'number') {
                return value(coerced, type);
            }

            if (type === 'string') {
                return value(escapeString(coerced), type);
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

    function isInvalidType (datum) {
        return !! invalidTypes[typeof datum];
    }

    function literal (datum) {
        value(datum, 'literal');
    }

    function value (datum, type) {
        emitter.emit(events[type], datum);
    }

    function array (datum) {
        // For an array, collection:object and collection:array are the same.
        return collection(datum, datum, 'array', function (item) {
            if (isInvalidType(item)) {
                return proceed(null);
            }

            return proceed(item);
        });
    }

    function collection (object, array, type, action) {
        var ignoreThisItem, resolve;

        if (references.indexOf(object) >= 0) {
            ignoreThisItem = ignoreItems = true;

            if (! ignoreCircularReferences) {
                emitter.emit(events.error, new Error('Circular reference.'));
            }
        } else {
            references.push(object);
        }

        emitter.emit(events[type]);

        setImmediate(item.bind(null, 0));

        return new Promise(function (r) {
            resolve = r;
        });

        function item (index) {
            if (index >= array.length) {
                if (ignoreThisItem) {
                    ignoreItems = false;
                }

                if (ignoreItems) {
                    return;
                }

                emitter.emit(events.endPrefix + events[type]);

                return resolve();
            }

            if (ignoreItems) {
                return item(index + 1);
            }

            action(array[index]).then(item.bind(null, index + 1));
        }
    }

    function object (datum) {
        // For an object, collection:object and collection:array are different.
        return collection(datum, Object.keys(datum), 'object', function (key) {
            var item = datum[key];

            if (isInvalidType(item)) {
                return Promise.resolve();
            }

            emitter.emit(events.property, key);

            return proceed(item);
        });
    }

    function escapeString (string) {
        string = JSON.stringify(string);
        return string.substring(1, string.length - 1);
    }
}

