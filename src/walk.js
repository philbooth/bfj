/*globals require, module, Promise, console */

'use strict';

var EventEmitter, JsonStream, asyncModule, error, events, terminators, escapes;

// TODO: When testing consider gradually adding to available text

EventEmitter = require('events').EventEmitter;
JsonStream = require('./stream');
asyncModule = require('./async');
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

module.exports = begin;

function begin (options) {
    var json, position, flags, scopes, handlers,
        emitter, stream, async;

    options = options || {};
    json = '';
    position = {
        index: 0,
        current: {
            line: 1,
            column: 1
        },
        previous: {}
    };
    flags = {
        stream: {
            ended: false
        },
        walk: {
            begun: false,
            ended: false,
            waiting: false,
            string: false
        }
    };
    scopes = [];
    handlers = {
        arr: value,
        obj: property
    };

    emitter = new EventEmitter();
    stream = new JsonStream(proceed);
    async = asyncModule.initialise(options);

    if (!options.verbose) {
        debug = function () {};
    }

    stream.on('finish', endStream);

    return {
        emitter: emitter,
        stream: stream
    };

    function proceed (chunk) {
        debug('proceed');

        if (!chunk || chunk.length === 0) {
            return;
        }

        json += chunk;

        if (!flags.walk.begun) {
            flags.walk.begun = true;
            return async.defer(value);
        }

        if (flags.walk.waiting) {
            flags.walk.waiting = false;
        }
    }

    function debug (caller) {
        console.log(caller + ': ' + debugPosition() + debugFlags());
    }

    function debugPosition () {
        var result;

        if (position.index === json.length) {
            result = 'EOF';
        } else {
            result = character();
        }

        return result + '[' + position.index + ']';
    }

    function character () {
        return json[position.index];
    }

    function debugFlags () {
        var result = '';

        debugFlag('stream', 'ended', 'sx');
        debugFlag('walk', 'begun', 'wb');
        debugFlag('walk', 'ended', 'wx');
        debugFlag('walk', 'waiting', 'ww');
        debugFlag('walk', 'string', 'ws');

        return result;

        function debugFlag (type, name, abbreviation) {
            if (flags[type][name]) {
                result += ' ' + abbreviation;
            }
        }
    }

    function value () {
        debug('value');

        ignoreWhitespace()
            .then(next)
            .then(handleValue);
    }

    function ignoreWhitespace () {
        var resolve;

        debug('ignoreWhitespace');

        async.defer(after);

        return new Promise(function (r) {
            resolve = r;
        });

        function after () {
            debug('ignoreWhitespace::after');

            awaitCharacter().then(step);
        }

        function step (hasCharacter) {
            debug('ignoreWhitespace::step');

            if (!hasCharacter) {
                return;
            }

            if (isWhitespace(character())) {
                return next().then(after);
            }

            resolve();
        }
    }

    function awaitCharacter () {
        var resolve;

        debug('awaitCharacter');

        async.defer(step);

        return new Promise(function (r) {
            resolve = r;
        });

        function step () {
            debug('awaitCharacter::step');

            if (position.index === json.length && !flags.stream.ended) {
                endWalk();
                return async.delay(step);
            }

            resolve(position.index < json.length);

            if (position.index === json.length) {
                async.defer(endWalk);
            }
        }
    }

    function next () {
        var resolve;

        debug('next');

        // TODO: discard old characters to save memory

        awaitCharacter().then(after);

        return new Promise(function (r) {
            resolve = r;
        });

        function after (hasCharacter) {
            var result;

            debug('next::after');

            if (!hasCharacter) {
                return;
            }

            result = character();

            position.index += 1;
            position.previous.line = position.current.line;
            position.previous.column = position.current.column;

            if (result === '\n') {
                position.current.line += 1;
                position.current.column = 1;
            } else {
                position.current.column += 1;
            }

            resolve(result);
        }
    }

    function handleValue (character) {
        debug('handleValue');

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
                fail(character, 'value', 'previous');
                value();
        }
    }

    function array () {
        debug('array');

        scope(events.array, value);
    }

    function scope (event, contentHandler) {
        debug('scope');

        emitter.emit(event);
        scopes.push(event);
        endScope(event).then(function (atScopeEnd) {
            debug('scope::endScope:');

            if (!atScopeEnd) {
                async.defer(contentHandler);
            }
        });
    }

    function endScope (scope) {
        var resolve;

        debug('endScope');

        ignoreWhitespace()
            .then(awaitCharacter)
            .then(afterWait);

        return new Promise(function (r) {
            resolve = r;
        });

        function afterWait (hasCharacter) {
            debug('endScope::afterWait');

            if (hasCharacter) {
                return afterNext(character());
            }

            next().then(afterNext);
        }

        function afterNext (character) {
            debug('endScope::afterNext');

            if (character !== terminators[scope]) {
                return resolve(false);
            }

            emitter.emit(events.endPrefix + scope);
            scopes.pop();

            next().then(function () {
                async.defer(endValue);
                resolve(true);
            });
        }
    }

    function endValue () {
        debug('endValue');

        ignoreWhitespace().then(function () {
            if (scopes.length === 0) {
                return awaitCharacter().then(afterWait);
            }

            checkScope();
        });

        function afterWait (hasCharacter) {
            debug('endValue::checkEnd');

            if (hasCharacter) {
                fail(character(), 'EOF', 'current');
                return async.defer(value);
            }

            checkScope();
        }

        function checkScope () {
            var scope;

            debug('endValue::checkScope');

            scope = scopes[scopes.length - 1];

            endScope(scope).then(function (atScopeEnd) {
                var handler;

                debug('endValue::checkScope::endScope');

                if (!atScopeEnd) {
                    handler = handlers[scope];

                    if (checkCharacter(character(), ',', 'current')) {
                        next().then(handler);
                    } else {
                        async.defer(handler);
                    }
                }
            });
        }
    }

    function fail (actual, expected, positionKey) {
        debug('fail');

        emitter.emit(
            events.error,
            error.create(
                actual,
                expected,
                position[positionKey].line,
                position[positionKey].column
            )
        );
    }

    function checkCharacter (character, expected, positionKey) {
        debug('checkCharacter');

        if (character !== expected) {
            fail(character, expected, positionKey);
            return false;
        }

        return true;
    }

    function object () {
        debug('object');

        scope(events.object, property);
    }

    function property () {
        debug('property');

        ignoreWhitespace()
            .then(next)
            .then(propertyName);
    }

    function propertyName (character) {
        debug('propertyName');

        checkCharacter(character, '"', 'previous');

        walkString(events.property)
            .then(ignoreWhitespace)
            .then(next)
            .then(propertyValue);
    }

    function propertyValue (character) {
        debug('propertyValue');

        checkCharacter(character, ':', 'previous');
        async.defer(value);
    }

    function walkString (event) {
        var isEscaping, string, resolve;

        debug('walkString');

        flags.walk.string = true;
        isEscaping = false;
        string = '';

        next().then(step);

        return new Promise(function (r) {
            resolve = r;
        });

        function step (character) {
            debug('walkString::step');

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

            flags.walk.string = false;
            emitter.emit(event, string);
            resolve();
        }
    }

    function escape (character) {
        var promise, resolve;

        debug('escape');

        promise = new Promise(function (r) {
            resolve = r;
        });

        if (escapes[character]) {
            resolve(escapes[character]);
        } else if (character === 'u') {
            escapeHex().then(resolve);
        } else {
            fail(character, 'escape character', 'previous');
            resolve('\\' + character);
        }

        return promise;
    }

    function escapeHex () {
        var hexits, resolve;

        debug('escapeHex');

        hexits = '';

        next().then(step.bind(null, 0));

        return new Promise(function (r) {
            resolve = r;
        });

        function step (index, character) {
            debug('escapeHex::step');

            if (isHexit(character)) {
                hexits += character;
            }

            if (index < 3) {
                return next().then(step.bind(null, index + 1));
            }

            if (hexits.length === 4) {
                return resolve(String.fromCharCode(parseInt(hexits, 16)));
            }

            fail(character, 'hex digit', 'previous');

            resolve('\\u' + hexits + character);
        }
    }

    function endStream () {
        debug('endStream');

        flags.stream.ended = true;

        if (position.index === json.length || !flags.walk.begun) {
            endWalk();
        }
    }

    function endWalk () {
        debug('endWalk');

        if (!flags.stream.ended) {
            flags.walk.waiting = true;
            return;
        }

        if (flags.walk.ended) {
            return;
        }

        flags.walk.ended = true;

        if (flags.walk.string) {
            fail('EOF', '"', 'current');
        }

        while (scopes.length > 0) {
            fail('EOF', terminators[scopes.pop()], 'current');
        }

        emitter.emit(events.end);
    }

    function string () {
        debug('string');

        walkString(events.string).then(endValue);
    }

    function number (firstCharacter) {
        var digits;

        debug('number');

        digits = firstCharacter;

        walkDigits().then(addDigits.bind(null, checkDecimalPlace));

        function addDigits (step, result) {
            debug('number::addDigits');

            digits += result.digits;

            if (result.atEnd) {
                return endNumber();
            }

            step();
        }

        function checkDecimalPlace () {
            debug('number::checkDecimalPlace');

            if (character() === '.') {
                return next().then(function (character) {
                    digits += character;
                    walkDigits().then(addDigits.bind(null, checkExponent));
                });
            }

            checkExponent();
        }

        function checkExponent () {
            debug('number::checkExponent');

            if (character() === 'e' || character() === 'E') {
                return next().then(function (character) {
                    digits += character;
                    awaitCharacter().then(checkSign);
                });
            }

            endNumber();
        }

        function checkSign (hasCharacter) {
            debug('number::checkExponent');

            if (!hasCharacter) {
                return fail('EOF', 'exponent', 'current');
            }

            if (character() === '+' || character() === '-') {
                return next().then(function (character) {
                    digits += character;
                    readExponent();
                });
            }

            readExponent();
        }

        function readExponent () {
            debug('number::readExponent');

            walkDigits().then(addDigits.bind(null, endNumber));
        }

        function endNumber () {
            debug('number::endNumber');

            emitter.emit(events.number, parseFloat(digits));
            async.defer(endValue);
        }
    }

    function walkDigits () {
        var digits, resolve;

        debug('walkDigits');

        digits = '';

        awaitCharacter().then(step);

        return new Promise(function (r) {
            resolve = r;
        });

        function step (hasCharacter) {
            debug('walkDigits::step');

            if (hasCharacter && isDigit(character())) {
                return next().then(function (character) {
                    debug('walkDigits::step::next');

                    digits += character;
                    awaitCharacter().then(step);
                });
            }

            resolve({
                digits: digits,
                atEnd: !hasCharacter
            });
        }
    }

    function literalFalse () {
        debug('literalFalse');

        literal([ 'a', 'l', 's', 'e' ], false);
    }

    function literal (expectedCharacters, value) {
        var actual, expected, invalid;

        debug('literal');

        awaitCharacter().then(step);

        function step (hasCharacter) {
            debug('literal::step');

            if (invalid || expectedCharacters.length === 0 || !hasCharacter) {
                if (invalid) {
                    fail(actual, expected, 'previous');
                } else if (expectedCharacters.length > 0) {
                    fail('EOF', expectedCharacters.shift(), 'current');
                } else {
                    emitter.emit(events.literal, value);
                }

                return async.defer(endValue);
            }

            next().then(function (character) {
                debug('literal::step::next');

                actual = character;
                expected = expectedCharacters.shift();

                if (actual !== expected) {
                    invalid = true;
                }

                awaitCharacter().then(step);
            });
        }
    }

    function literalNull () {
        debug('literalNull');

        literal([ 'u', 'l', 'l' ], null);
    }

    function literalTrue () {
        debug('literalTrue');

        literal([ 'r', 'u', 'e' ], true);
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

