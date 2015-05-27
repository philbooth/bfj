/*globals require, module, Promise, setImmediate */

'use strict';

var EventEmitter, check, error, events, terminators, escapes;

EventEmitter = require('events').EventEmitter;
check = require('check-types');
error = require('./error');
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

module.exports = initialise;

/**
 * Public function `walk`.
 *
 * Returns an event emitter and asynchronously walks a stream of JSON data,
 * emitting events as it encounters tokens.
 *
 * @param stream:   Readable instance representing the incoming JSON.
 *
 * @option discard: The number of characters to process before discarding
 *                  them to save memory. The default value is `16384`.
 **/
function initialise (stream, options) {
    var json, index, currentPosition, previousPosition,
        isStreamEnded, isWalkBegun, isWalkEnded, isWalkingString,
        scopes, handlers, resumeFn, emitter, discardThreshold;

    check.assert.instance(stream, require('stream').Readable);

    options = options || {};
    json = '';
    index = 0;
    currentPosition = {
        line: 1,
        column: 1
    };
    previousPosition = {};
    isStreamEnded = isWalkBegun = isWalkEnded = isWalkingString = false;
    scopes = [];
    handlers = {
        arr: value,
        obj: property
    };

    emitter = new EventEmitter();

    discardThreshold = options.discard || 16384;

    stream.setEncoding('utf8');
    stream.on('data', readStream);
    stream.on('end', endStream);

    return emitter;

    function readStream (chunk) {
        json += chunk;

        if (!isWalkBegun) {
            isWalkBegun = true;
            value();
            return;
        }

        resume();
    }

    function value () {
        awaitNonWhitespace()
            .then(next)
            .then(handleValue);
    }

    function awaitNonWhitespace () {
        var resolve, reject;

        wait();

        return new Promise(function (res, rej) {
            resolve = res;
            reject = rej;
        });

        function wait () {
            awaitCharacter().then(step).catch(reject);
        }

        function step () {
            if (!isWhitespace(character())) {
                return resolve();
            }

            next().then(wait);
        }
    }

    function awaitCharacter () {
        var resolve, reject;

        if (index < json.length) {
            return Promise.resolve();
        }

        if (isStreamEnded) {
            setImmediate(endWalk);
            return Promise.reject();
        }

        resumeFn = after;

        return new Promise(function (res, rej) {
            resolve = res;
            reject = rej;
        });

        function after () {
            if (index < json.length) {
                return resolve();
            }

            reject();

            if (isStreamEnded) {
                setImmediate(endWalk);
            }
        }
    }

    function character () {
        return json[index];
    }

    function next () {
        var resolve;

        awaitCharacter().then(after);

        return new Promise(function (r) {
            resolve = r;
        });

        function after () {
            var result;

            result = character();

            index += 1;
            previousPosition.line = currentPosition.line;
            previousPosition.column = currentPosition.column;

            if (result === '\n') {
                currentPosition.line += 1;
                currentPosition.column = 1;
            } else {
                currentPosition.column += 1;
            }

            if (index === discardThreshold) {
                json = json.substring(index);
                index = 0;
            }

            resolve(result);
        }
    }

    function handleValue (character) {
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
            case 'f':
                return literalFalse();
            case 'n':
                return literalNull();
            case 't':
                return literalTrue();
            default:
                fail(character, 'value', previousPosition);
                value();
        }
    }

    function array () {
        scope(events.array, value);
    }

    function scope (event, contentHandler) {
        emitter.emit(event);
        scopes.push(event);
        endScope(event).then(contentHandler);
    }

    function endScope (scope) {
        var resolve;

        awaitNonWhitespace().then(after).catch(endWalk);

        return new Promise(function (r) {
            resolve = r;
        });

        function after () {
            if (character() !== terminators[scope]) {
                return resolve();
            }

            emitter.emit(events.endPrefix + scope);
            scopes.pop();

            next().then(endValue);
        }
    }

    function endValue () {
        awaitNonWhitespace().then(after).catch(endWalk);

        function after () {
            if (scopes.length === 0) {
                fail(character(), 'EOF', currentPosition);
                return setImmediate(value);
            }

            checkScope();
        }

        function checkScope () {
            var scope;

            scope = scopes[scopes.length - 1];

            endScope(scope).then(function () {
                var handler = handlers[scope];

                if (checkCharacter(character(), ',', currentPosition)) {
                    next().then(handler);
                } else {
                    handler();
                }
            });
        }
    }

    function fail (actual, expected, position) {
        emitter.emit(
            events.error,
            error.create(
                actual,
                expected,
                position.line,
                position.column
            )
        );
    }

    function checkCharacter (character, expected, position) {
        if (character !== expected) {
            fail(character, expected, position);
            return false;
        }

        return true;
    }

    function object () {
        scope(events.object, property);
    }

    function property () {
        awaitNonWhitespace()
            .then(next)
            .then(propertyName);
    }

    function propertyName (character) {
        checkCharacter(character, '"', previousPosition);

        walkString(events.property)
            .then(awaitNonWhitespace)
            .then(next)
            .then(propertyValue);
    }

    function propertyValue (character) {
        checkCharacter(character, ':', previousPosition);
        value();
    }

    function walkString (event) {
        var isEscaping, string, resolve;

        isWalkingString = true;
        isEscaping = false;
        string = '';

        next().then(step);

        return new Promise(function (r) {
            resolve = r;
        });

        function step (character) {
            if (isEscaping) {
                isEscaping = false;

                return escape(character).then(function (escaped) {
                    string += escaped;
                    next().then(step);
                });
            }

            if (character === '\\') {
                isEscaping = true;
                return next().then(step);
            }

            if (character !== '"') {
                string += character;
                return next().then(step);
            }

            isWalkingString = false;
            emitter.emit(event, string);
            resolve();
        }
    }

    function escape (character) {
        var promise, resolve;

        promise = new Promise(function (r) {
            resolve = r;
        });

        if (escapes[character]) {
            resolve(escapes[character]);
        } else if (character === 'u') {
            escapeHex().then(resolve);
        } else {
            fail(character, 'escape character', previousPosition);
            resolve('\\' + character);
        }

        return promise;
    }

    function escapeHex () {
        var hexits, resolve;

        hexits = '';

        next().then(step.bind(null, 0));

        return new Promise(function (r) {
            resolve = r;
        });

        function step (index, character) {
            if (isHexit(character)) {
                hexits += character;
            }

            if (index < 3) {
                return next().then(step.bind(null, index + 1));
            }

            if (hexits.length === 4) {
                return resolve(String.fromCharCode(parseInt(hexits, 16)));
            }

            fail(character, 'hex digit', previousPosition);

            resolve('\\u' + hexits + character);
        }
    }

    function string () {
        walkString(events.string).then(endValue);
    }

    function number (firstCharacter) {
        var digits;

        digits = firstCharacter;

        walkDigits().then(addDigits.bind(null, checkDecimalPlace));

        function addDigits (step, result) {
            digits += result.digits;

            if (result.atEnd) {
                return endNumber();
            }

            step();
        }

        function checkDecimalPlace () {
            if (character() === '.') {
                return next().then(function (character) {
                    digits += character;
                    walkDigits().then(addDigits.bind(null, checkExponent));
                });
            }

            checkExponent();
        }

        function checkExponent () {
            if (character() === 'e' || character() === 'E') {
                return next().then(function (character) {
                    digits += character;
                    awaitCharacter()
                        .then(checkSign)
                        .catch(fail.bind(null, 'EOF', 'exponent', currentPosition));
                });
            }

            endNumber();
        }

        function checkSign () {
            if (character() === '+' || character() === '-') {
                return next().then(function (character) {
                    digits += character;
                    readExponent();
                });
            }

            readExponent();
        }

        function readExponent () {
            walkDigits().then(addDigits.bind(null, endNumber));
        }

        function endNumber () {
            emitter.emit(events.number, parseFloat(digits));
            endValue();
        }
    }

    function walkDigits () {
        var digits, resolve;

        digits = '';

        wait();

        return new Promise(function (r) {
            resolve = r;
        });

        function wait () {
            awaitCharacter().then(step).catch(atEnd);
        }

        function step () {
            if (isDigit(character())) {
                return next().then(function (character) {
                    digits += character;
                    wait();
                });
            }

            resolve({
                digits: digits,
                atEnd: false
            });
        }

        function atEnd () {
            resolve({
                digits: digits,
                atEnd: true
            });
        }
    }

    function literalFalse () {
        literal([ 'a', 'l', 's', 'e' ], false);
    }

    function literal (expectedCharacters, value) {
        var actual, expected, invalid;

        wait();

        function wait () {
            awaitCharacter().then(step).catch(atEnd);
        }

        function step () {
            if (invalid || expectedCharacters.length === 0) {
                return atEnd();
            }

            next().then(afterNext);
        }

        function atEnd () {
            if (invalid) {
                fail(actual, expected, previousPosition);
            } else if (expectedCharacters.length > 0) {
                fail('EOF', expectedCharacters.shift(), currentPosition);
            } else {
                done();
            }

            endValue();
        }

        function afterNext (character) {
            actual = character;
            expected = expectedCharacters.shift();

            if (actual !== expected) {
                invalid = true;
            }

            wait();
        }

        function done () {
            emitter.emit(events.literal, value);
        }
    }

    function literalNull () {
        literal([ 'u', 'l', 'l' ], null);
    }

    function literalTrue () {
        literal([ 'r', 'u', 'e' ], true);
    }

    function endStream () {
        isStreamEnded = true;

        if (!isWalkBegun) {
            endWalk();
            return;
        }

        resume();
    }

    function endWalk () {
        if (isWalkEnded) {
            return;
        }

        isWalkEnded = true;

        if (isWalkingString) {
            fail('EOF', '"', currentPosition);
        }

        while (scopes.length > 0) {
            fail('EOF', terminators[scopes.pop()], currentPosition);
        }

        emitter.emit(events.end);
    }

    function resume () {
        if (resumeFn) {
            resumeFn();
            resumeFn = undefined;
        }
    }
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
    return isDigit(character) ||
           isInRange(character, 'A', 'F') ||
           isInRange(character, 'a', 'f');
}

function isDigit (character) {
    return isInRange(character, '0', '9');
}

function isInRange (character, lower, upper) {
    var code = character.charCodeAt(0);

    return code >= lower.charCodeAt(0) && code <= upper.charCodeAt(0);
}

