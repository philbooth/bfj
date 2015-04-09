/*globals require, module, setImmediate, Promise, console */

'use strict';

var EventEmitter;

EventEmitter = require('events').EventEmitter;
error = require('./error');
events = require('./events');

module.exports = eventify;

/**
 * Public function `eventify`.
 *
 * Asynchronously traverses a data structure (depth-first) and returns an
 * EventEmitter instance, emitting events as it encounters data. Sanely
 * handles promises, dates, sets and maps.
 *
 * @param data:      The data structure to traverse.
 *
 * @option apply:    Dictionary of {function name:argument array} pairs.
 *                   When functions are encountered in the data, this
 *                   object is checked for keys that match the function
 *                   name. If a match exists, the function is applied
 *                   using the associated argument array and an event is
 *                   emitted for the result. If no match exists or this
 *                   option is not specified, the function is ignored.
 *                   
 * @option promises: 'resolve' or 'ignore', default is 'resolve'.
 *
 * @option dates:    'json' or 'ignore', default is 'json'.
 *
 * @option sets:     'array', or 'ignore', default is 'array'.
 *
 * @option maps:     'object', or 'ignore', default is 'object'.
 *
 * @option debug:    Log debug messages to the console.
 **/
function eventify (data, options) {
    var await, coerce, context, emitter, current;

    await = {};
    coerce = {};
    context = [];
    emitter = new EventEmitter();

    normaliseOptions();
    setImmediate(begin);

    return emitter;

    function normaliseOptions () {
        options = options || {};
        options.apply = options.apply || {};

        normaliseOption('promises', await);
        normaliseOption('dates', coerce);
        normaliseOption('sets', coerce);
        normaliseOption('maps', coerce);

        if (!options.debug) {
            debug = function () {};
        }
    }

    function normaliseOption (key, action) {
        if (options[key] !== 'ignore') {
            action[key] = true;
        }
    }

    function begin () {
        current = data;
        proceed();
    }

    function proceed () {
        emitter.emit(getEvent(current));
    }

    function getEvent (value) {
    }
}

