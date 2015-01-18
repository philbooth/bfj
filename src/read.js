/*globals require, module, setImmediate */

'use strict';

var check, EventEmitter, JsonError, events,
    terminators, literals, codes;

check = require('check-types');
EventEmitter = require('events').EventEmitter;
JsonError = require('./error');
events = require('./events');

terminators = {
    obj: '}',
    arr: ']'
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

module.exports = read;

function read (json) {
    var emitter, index, line, column, done, scopes, handlers;

    check.assert.string(json, 'JSON must be a string.');

    emitter = new EventEmitter();
    index = 0;
    line = column = 1;
    done = false;
    scopes = [];
    handlers = {
        arr: value,
        obj: property
    };

    defer(value);

    return emitter;

    function value () {
        var character;

        ignoreWhitespace();

        character = next();

        switch (character) {
            case '[':
                return array();
            case '{':
                return object();
            case '"':
                return string();
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
            case '-':
            case '.':
                return number(character);
            default:
                return literal(character);
        }
    }

    function ignoreWhitespace () {
        while (isWhitespace(character())) {
            next();
        }
    }

    function next () {
        var result;

        if (index === json.length) {
            end();
        }

        result = character();

        if (result === '\n') {
            line += 1;
            column = 1;
        } else {
            column += 1;
        }

        index += 1;

        return result;
    }

    function end () {
        while (scopes.length > 0) {
            error('EOF', terminators[scopes.pop()]);
        }

        emitter.emit(events.end);

        throw events.end;
    }

    function error (actual, expected) {
        emitter.emit(events.error, new JsonError(actual, expected, line, column));
    }

    function character () {
        return json[index];
    }

    function array () {
        scope(events.array, value);
    }

    function scope (event, contentHandler) {
        emitter.emit(event);
        scopes.push(event);
        if (!endScope(event)) {
            defer(contentHandler);
        }
    }

    function object () {
        scope(events.object, property);
    }

    function property () {
        ignoreWhitespace();
        checkCharacter(next(), '"');

        readString(events.property);

        ignoreWhitespace();
        checkCharacter(next(), ':');

        defer(value);
    }

    function readString (event) {
        var string = '';

        while (character() !== '"') {
            string += next();
        }

        emitter.emit(event, string);
    }

    function checkCharacter (character, expected) {
        if (character !== expected) {
            return error('`' + character + '`', '`' + expected + '`');
        }
    }

    function endScope (scope) {
        if (character() === terminators[scope]) {
            emitter.emit(events.endPrefix + scope);
            scopes.pop();
            next();
            defer(endValue);
            return true;
        }

        return false;
    }

    function endValue () {
        var scope;

        ignoreWhitespace();

        if (scopes.length === 0) {
            return defer(value);
        }

        scope = scopes[scopes.length - 1];

        if (!endScope(scope)) {
            checkCharacter(next(), ',');
            defer(handlers[scope]);
        }
    }

    function string () {
        readString(events.string);
        defer(endValue);
    }

    function number (firstCharacter) {
        var digits = firstCharacter + readDigits();

        if (character() === '.') {
            digits += next() + readDigits();
        }

        if (character() === 'e' || character() === 'E') {
            digits += next();

            if (character() === '+' || character() === '-') {
                digits += next();
            }

            digits += readDigits();
        }

        emitter.emit(events.number, parseFloat(digits));
        defer(endValue);
    }

    function readDigits () {
        var digits = '';

        while (isNumber(character())) {
            digits += next();
        }

        return digits;
    }

    function literal (character) {
        var characters = character;

        while (isLowercase(character())) {
            characters += next();
        }

        // TODO: Handle invalid literals

        emitter.emit(events.literal, literals[characters]);
        defer(endValue);
    }
}

function defer (fn) {
    setImmediate(function () {
        try {
            fn();
        } catch (error) {
            /*jshint noempty:false */
        }
    });
}

function isWhitespace (character) {
    switch (character) {
        case ' ':
        case '\t':
        case '\r':
        case '\n':
            return true;
    }

    return false;
}

function isNumber (character) {
    return checkCode(character, codes.zero, codes.nine);
}

function checkCode (character, lower, upper) {
    var code = character.charCodeAt(0);

    return code >= codes[lower] && code <= codes[upper];
}

function isLowercase (character) {
    return checkCode(character, codes.a, codes.z);
}

