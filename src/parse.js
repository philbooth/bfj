/*globals require, module */

'use strict';

var check, walk, events;

check = require('check-types');
walk = require('./walk');
events = require('./events');

module.exports = {
    parse: parse
};

function parse (json, callback) {
    var emitter, scopes, errors, done, key;

    check.assert.maybe.function(callback, 'Callback must be a function.');

    emitter = walk(json);
    scopes = [];
    errors = [];
    done = false;

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

    if (callback) {
        return;
    }

    while (!done) {
        /*jshint noempty:false */
    }

    if (errors.length > 0) {
        return errors[0];
    }

    return scopes[0];

    function array () {
        beginScope([]);
    }

    function beginScope (parsed) {
        if (scopes.length > 0) {
            value(parsed);
        }

        scopes.push(parsed);
    }

    function value (v) {
        var scope = scopes[scopes.length - 1];

        if (key) {
            scope[key] = v;
            key = undefined;
        } else {
            scope.push(v);
        }
    }

    function object () {
        beginScope({});
    }

    function property (name) {
        key = name;
    }

    function endScope () {
        scopes.pop();
    }

    function end () {
        if (callback) {
            return callback(scopes[0]);
        }

        done = true;
    }

    function error (error) {
        errors.push(error);
    }
}

