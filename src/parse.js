/*globals require, module, Promise */

'use strict';

var check, walk, events;

check = require('check-types');
walk = require('./walk');
events = require('./events');

module.exports = parse;

function parse (stream, options) {
    var walker, scopes, errors, resolve, reject, key;

    walker = walk(options);
    stream.pipe(walker.stream);

    scopes = [];
    errors = [];

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
        if (errors.length > 0) {
            return reject(errors[0]);
        }

        resolve(scopes[0]);
    }

    function error (e) {
        errors.push(e);
    }
}

