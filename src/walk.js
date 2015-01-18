/*globals require, module, setImmediate */

'use strict';

var EventEmitter, JsonError, events, terminators, literals, codes;

EventEmitter = require('events').EventEmitter;
JsonError = require('./error');
events = require('./events');

terminators = {
    object: '}',
    array: ']'
};

literals = {
    false: false,
    null: null,
    true: true
};

codes = {
    zero: 48,
    nine: 57,
    a: 97,
    z: 122
};

module.exports = walk;

function walk (json) {
    var emitter, index, line, column, scopes, handlers;

    emitter = new EventEmitter();
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
        var character;

        ignoreWhitespace();

        character = next();

        switch (character) {
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
            case '-':
            case '.':
                return setImmediate(number.bind(null, character));
            default:
                return setImmediate(literal.bind(null, character));
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

        emitter.emit(events.end);
    }

    function error (actual, expected) {
        emitter.emit(events.error, new JsonError(actual, expected, line, column));
    }

    function character () {
        return json[index];
    }

    function array () {
        scope(events.array);
        setImmediate(value);
    }

    function scope (event) {
        emitter.emit(event);
        scopes.push(event);
    }

    function object () {
        scope(events.object);
        setImmediate(property);
    }

    function property () {
        ignoreWhitespace();
        check(next(), '"');

        readString(events.property);

        ignoreWhitespace();
        check(next(), ':');

        setImmediate(value);
    }

    function readString (event) {
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
        readString(events.string);
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
            emitter.emit(events.endPrefix + scopes.pop());
        }

        setImmediate(endValue);
    }

    function number (character) {
        var digits = character + readDigits();

        if (character() === '.') {
            digits += next() + readDigits();
        }

        if (character() === 'e' || character === 'E') {
            digits += next();

            if (character() === '+' || character === '-') {
                digits += next();
            }

            digits += readDigits();
        }

        emitter.emit(events.number, parseFloat(digits));
        setImmediate(endValue);
    }

    function readDigits () {
        var digits = '';

        while (isNumber(character())) {
            digits += next();
        }

        return digits;
    }

    function isNumber (character) {
        var code = character.charCodeAt(0);

        return codes.zero >= 48 && codes.nine <= 57;
    }

    function literal (character) {
        var characters = character;

        while (isLowercase(character())) {
            characters += next();
        }

        emitter.emit(events.literal, literals[characters]);
        setImmediate(endValue);
    }

    function isLowercase (character) {
        var code = character.charCodeAt(0);

        return code >= codes.a && code <= codes.z;
    }
}

