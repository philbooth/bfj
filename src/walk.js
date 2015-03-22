/*globals require, module, setImmediate, setTimeout, Promise */

'use strict';

var EventEmitter, check, JsonStream, asyncModule, errors, events, terminators, escapes;

// TODO: When testing consider gradually adding to available text

EventEmitter = require('events').EventEmitter;
check = require('check-types');
JsonStream = require('./stream');
asyncModule = require('./async');
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

module.exports = begin;

function begin (options) {
    var json, position, scopes, handlers,
        emitter, stream, async,
        walking, insideString, finished;

    json = '';
    position = {
        index: 0,
        current: {
            line: 1,
            column: 1
        },
        previous: {}
    };
    scopes = [];
    handlers = {
        arr: value,
        obj: property
    };

    emitter = new EventEmitter();
    stream = new JsonStream(proceed);
    async = asyncModule.initialise(options || {});

    stream.on('finish', finish);

    return {
        emitter: emitter,
        stream: stream
    };

    function proceed (chunk) {
        json += chunk;

        if (!walking) {
            walking = true;
            async.defer(value);
        }
    }

    function finish () {
        finished = true;

        if (!walking) {
            end();
        }
    }

    function value () {
        ignoreWhitespace().then(function () {
            next().then(handleValue);
        });
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
                error(character, 'value', 'previous');
                value();
        }
    }

    function ignoreWhitespace () {
        var resolve;

        async.defer(step.bind(null, character()));

        return new Promise(function (r) {
            resolve = r;
        });

        function step (character) {
            if (isWhitespace(character)) {
                return next().then(step);
            }

            resolve();
        }
    }

    function next () {
        var resolve;

        // TODO: discard old characters to save memory

        isEnd().then(function (atEnd) {
            var result;

            if (atEnd) {
                return end();
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
        });

        return new Promise(function (r) {
            resolve = r;
        });
    }

    function isEnd () {
        var resolve;

        async.defer(step);

        return new Promise(function (r) {
            resolve = r;
        });

        function step () {
            if (walking) {
                return resolve(position.index === json.length);
            }

            async.delay(step);
        }
    }

    function end () {
        if (!finished) {
            walking = false;
            return;
        }

        if (insideString) {
            error('EOF', '"', 'current');
        }

        while (scopes.length > 0) {
            error('EOF', terminators[scopes.pop()], 'current');
        }

        emitter.emit(events.end);
    }

    function error (actual, expected, positionKey) {
        emitter.emit(
            events.error,
            errors.create(
                actual,
                expected,
                position[positionKey].line,
                position[positionKey].column
            )
        );
    }

    function character () {
        return json[position.index];
    }

    function array () {
        scope(events.array, value);
    }

    function scope (event, contentHandler) {
        emitter.emit(event);
        scopes.push(event);
        endScope(event).then(function (atScopeEnd) {
            if (!atScopeEnd) {
                async.defer(contentHandler);
            }
        });
    }

    function endScope (scope) {
        return new Promise(function (resolve) {
            if (character() !== terminators[scope]) {
                return resolve(false);
            }

            emitter.emit(events.endPrefix + scope);
            scopes.pop();

            next().then(function () {
                async.defer(endValue);
                resolve(true);
            });
        });
    }

    function object () {
        scope(events.object, property);
    }

    function property () {
        ignoreWhitespace().then(function () {
            next().then(propertyName);
        });
    }

    function propertyName (character) {
        checkCharacter(character, '"');
        walkString(events.property).then(function () {
            ignoreWhitespace().then(function () {
                next().then(propertyValue);
            });
        });
    }

    function propertyValue (character) {
        checkCharacter(character, ':');
        async.defer(value);
    }

    function walkString (event) {
        var quoting, string, resolve;

        // TODO: This is wrong, see empty objects / `end: inside string` log
        insideString = true;
        quoting = false;
        string = '';

        next().then(step);

        return new Promise(function (r) {
            resolve = r;
        });

        function step (character) {
            if (quoting) {
                quoting = false;

                return escape(character).then(function (escaped) {
                    string += escaped;
                    next().then(step);
                });
            }

            if (character === '\\') {
                quoting = true;
                return next().then(step);
            }

            if (character !== '"') {
                string += character;
                return next().then(step);
            }

            insideString = false;
            emitter.emit(event, string);
            resolve();
        }
    }

    function escape (character) {
        return new Promise(function (resolve) {
            if (escapes[character]) {
                return resolve(escapes[character]);
            }

            if (character === 'u') {
                return escapeHex().then(resolve);
            }

            error(character, 'escape character', 'previous');

            resolve('\\' + character);
        });
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

            error(character, 'hex digit', 'previous');

            resolve('\\u' + hexits + character);
        }
    }

    function checkCharacter (character, expected) {
        if (character !== expected) {
            error(character, expected, 'previous');
        }
    }

    function endValue () {
        ignoreWhitespace().then(function () {
            if (scopes.length === 0) {
                return isEnd().then(checkEnd);
            }

            checkScope();
        });

        function checkEnd (atEnd) {
            if (!atEnd) {
                error(character(), 'EOF', 'current');
                return async.defer(value);
            }

            checkScope();
        }

        function checkScope () {
            var scope = scopes[scopes.length - 1];

            endScope().then(function (atScopeEnd) {
                if (!atScopeEnd) {
                    next().then(function (character) {
                        checkCharacter(character, ',');
                        async.defer(handlers[scope]);
                    });
                }
            });
        }
    }

    function string () {
        walkString(events.string).then(function () {
            next().then(async.defer.bind(null, endValue));
        });
    }

    function number (firstCharacter) {
        var digits = firstCharacter;

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
                    checkSign();
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
            async.defer(endValue);
        }
    }

    function walkDigits () {
        var digits, resolve;

        digits = '';

        isEnd().then(step);

        return new Promise(function (r) {
            resolve = r;
        });

        function step (atEnd) {
            if (atEnd || !isDigit(character())) {
                return resolve({
                    digits: digits,
                    atEnd: atEnd
                });
            }

            next().then(function (character) {
                digits += character;
                isEnd().then(step);
            });
        }
    }

    function literalFalse () {
        literal([ 'a', 'l', 's', 'e' ], false);
    }

    function literal (expectedCharacters, value) {
        var actual, expected, invalid;

        isEnd().then(step);

        function step (atEnd) {
            if (invalid || atEnd || expectedCharacters.length === 0) {
                if (invalid) {
                    error(actual, expected, 'previous');
                } else if (expectedCharacters.length > 0) {
                    error('EOF', expectedCharacters.shift(), 'current');
                } else {
                    emitter.emit(events.literal, value);
                }

                return async.defer(endValue);
            }

            next().then(function (character) {
                actual = character;
                expected = expectedCharacters.shift();

                if (actual !== expected) {
                    invalid = true;
                }

                isEnd().then(step);
            });
        }
    }

    function literalNull () {
        literal([ 'u', 'l', 'l' ], null);
    }

    function literalTrue () {
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

