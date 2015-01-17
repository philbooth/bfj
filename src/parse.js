/*globals require, module, setImmediate */

'use strict';

var events, JsonError, terminators;

events = require('events');
JsonError = require('JsonError');

terminators = {
    object: '}',
    array: ']'
};

module.exports = parse;

function parse (json) {
    var emitter, index, line, column, scopes, handlers;

    emitter = new events.EventEmitter();
    index = 0;
    line = column = 1;
    scopes = [];
    handlers = {
        array: value,
        object: property
    };

    setImmediate(value);

    return emitter;

    function value () {
        ignoreWhitespace();

        switch (next()) {
            case '[':
                return setImmediate(array);
            case '{':
                return setImmediate(object);
            case '"':
                return setImmediate(string);
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
                return setImmediate(number);
            default:
                return setImmediate(literal);
        }
    }

    function ignoreWhitespace () {
        while (true) {
            switch (next()) {
                case ' ':
                case '\t':
                case '\r':
                case '\n':
                    continue;
            }

            break;
        }
    }

    function next () {
        if (index === json.length) {
            return end();
        }

        if (character() === '\n') {
            line += 1;
            column = 1;
        } else {
            column += 1;
        }

        return character();
    }

    function end () {
        while (scopes.length > 0) {
            error('EOF', terminators[scopes.pop()]);
        }

        emitter.emit('end');
    }

    function error (actual, expected) {
        emitter.emit('error', new JsonError(actual, expected, line, column));
    }

    function character () {
        return json[index];
    }

    function array () {
        scope('array');
        setImmediate(value);
    }

    function scope (type) {
        emitter.emit(type);
        scopes.push(type);
    }

    function object () {
        scope('object');
        setImmediate(property);
    }

    function property () {
        ignoreWhitespace();
        check(next(), '"');

        parseString('property');

        ignoreWhitespace();
        check(next(), ':');

        setImmediate(value);
    }

    function parseString (event) {
        var string = '';

        while (character() !== '"') {
            string += next();
        }

        emitter.emit(event, string);
    }

    function check (character, expected) {
        if (character !== expected) {
            return error('`' + character + '`', '`' + expected + '`');
        }
    }

    function string () {
        parseString('string');
        setImmediate(endValue);
    }

    function endValue () {
        var scope, character;

        ignoreWhitespace();

        if (scopes.length === 0) {
            return setImmediate(value);
        }

        scope = scopes[scopes.length - 1];
        character = next();

        if (character === ',') {
            return setImmediate(handlers[scope]);
        }

        check(character, terminators[scope]);

        if (character === terminators[scope]) {
            emitter.emit('end-' + scopes.pop());
        }

        setImmediate(endValue);
    }

    function number () {
        // TODO: Implement.
    }

    function literal () {
        // TODO: Implement.
    }
}
