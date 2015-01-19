/*globals require, module, setImmediate */

'use strict';

var check, EventEmitter, errors, events,
    terminators, escapes, literals;

check = require('check-types');
EventEmitter = require('events').EventEmitter;
errors = require('./errors');
events = require('./events');

terminators = {
    obj: '}',
    arr: ']'
};

escapes = {
    '"': '"',
    '\\': '\\',
    '/': '/',
    'b': '\b',
    'f': '\f',
    'n': '\n',
    'r': '\r',
    't': '\t'
};

literals = {
    false: false,
    null: null,
    true: true
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

        if (isEnd()) {
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

    function isEnd () {
        return index === json.length;
    }

    function end () {
        while (scopes.length > 0) {
            error('EOF', terminators[scopes.pop()]);
        }

        emitter.emit(events.end);

        throw events.end;
    }

    function error (actual, expected) {
        emitter.emit(events.error, errors.create(actual, expected, line, column));
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
        var quoting, string;

        quoting = false;
        string = '';

        while (quoting || character() !== '"') {
            if (quoting) {
                quoting = false;
                string += escape(next());
            } else if (character() === '\\') {
                quoting = true;
                next();
            } else {
                string += next();
            }
        }

        emitter.emit(event, string);
    }

    function escape (character) {
        var hexits, i;

        if (escapes[character]) {
            return escapes[character];
        }

        if (character === 'u') {
            return escapeHex();
        }

        error(character, 'escape character');

        return '\\' + character;
    }

    function escapeHex () {
        var hexits, i, character;

        hexits = '';

        for (i = 0; i < 4; i += 1) {
            character = next();
            if (isHexit(character)) {
                hexits += character;
            }
        }

        if (hexits.length === 4) {
            return String.fromCharCode(parseInt(hexits, 16));
        }

        error(character, 'hex digit');

        return '\\u' + hexits + character;
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

        if (scopes.length === 0 && !isEnd()) {
            error(character(), 'EOF');
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
        next();
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

        while (!isEnd() && isDigit(character())) {
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

function isHexit (character) {
    return isDigit(character) || isInRange(character, 'a', 'f');
}

function isDigit (character) {
    return isInRange(character, '0', '9');
}

function isInRange (character, lower, upper) {
    var code = character.charCodeAt(0);

    return code >= lower.charCodeAt(0) && code <= upper.charCodeAt(0);
}

function isLowercase (character) {
    return isInRange(character, 'a', 'z');
}

