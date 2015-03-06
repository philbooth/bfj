/*globals require, module, setImmediate, setTimeout */

'use strict';

var util, Writable, EventEmitter, check, errors, events, terminators, escapes;

// TODO: Consider when to test `walking` and `finished` (currently in `end`)
// TODO: Ensure that we recur from tail positions
// TODO: Make new promisified code work with tests
// TODO: When testing consider gradually adding to available text
// TODO: Test delay argument

util = require('util');
Writable = require('stream').Writable;
EventEmitter = require('events').EventEmitter;
check = require('check-types');
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

function begin (delay) {
    var json, emitter, stream,
        position, scopes, handlers,
        walking, insideString, finished;

    json = '';
    emitter = new EventEmitter();
    stream = new JsonStream(proceed);

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

    stream.on('finish', finish);

    return {
        emitter: emitter,
        stream: stream
    };

    function proceed (chunk) {
        json += chunk;

        if (!walking) {
            walking = true;
            defer(value);
        }
    }

    function finish () {
        finished = true;
    }

    function value () {
        ignoreWhitespace.then(function () {
            next.then(handleValue);
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

        next.then(step);

        return new Promise(function (r) {
            resolve = r;
        });

        function step (character) {
            if (isWhitespace(character)) {
                return next.then(step);
            }

            resolve();
        }
    }

    function next () {
        var resolve;

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

        defer(step);

        return new Promise(function (r) {
            resolve = r;
        });

        function step () {
            if (walking) {
                return resolve(position.index === json.length);
            }

            wait(step);
        }
    }

    function wait (after) {
        setTimeout(after, delay || 1000);
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
        endScope.then(function (atScopeEnd) {
            if (!atScopeEnd) {
                defer(contentHandler);
            }
        });
    }

    function object () {
        scope(events.object, property);
    }

    function property () {
        ignoreWhitespace.then(function () {
            next.then(propertyName);
        });
    }

    function propertyName (character) {
        checkCharacter(character, '"');
        walkString(events.property).then(function () {
            ignoreWhitespace.then(function () {
                next.then(propertyValue);
            });
        });
    }

    function propertyValue (character) {
        checkCharacter(character, ':');
        defer(value);
    }

    function walkString (event) {
        var quoting, string;

        insideString = true;
        quoting = false;
        string = '';

        next.then(step);

        function step (character) {
            if (quoting) {
                quoting = false;

                return next.then(function (character) {
                    escape(character).then(function (escaped) {
                        string += escaped;
                        next.then(step);
                    });
                });
            }

            if (character === '\\') {
                quoting = true;
                return next.then(step);
            }

            if (character !== '"') {
                return next.then(function (character) {
                    string += character;
                    next.then(step);
                });
            }

            insideString = false;
            emitter.emit(event, string);
        }
    }

    function escape (character) {
        if (escapes[character]) {
            return escapes[character];
        }

        if (character === 'u') {
            return escapeHex();
        }

        error(character, 'escape character', 'previous');

        return '\\' + character;
    }

    function escapeHex () {
        var hexits, resolve;

        hexits = '';

        next.then(step);

        return new Promise(function (r) {
            resolve = r;
        });

        function step (index, character) {
            if (index === 4) {
                if (hexits.length === 4) {
                    return resolve(String.fromCharCode(parseInt(hexits, 16)));
                }

                error(character, 'hex digit', 'previous');

                return resolve('\\u' + hexits + character);
            }

            if (isHexit(character)) {
                hexits += character;
            }

            next.then(step.bind(null, index + 1));
        }
    }

    function checkCharacter (character, expected) {
        if (character !== expected) {
            return error(character, expected, 'previous');
        }
    }

    function endScope (scope) {
        return new Promise(function (resolve) {
            if (character() !== terminators[scope]) {
                return resolve(false);
            }

            emitter.emit(events.endPrefix + scope);
            scopes.pop();

            next.then(function () {
                defer(endValue);
                resolve(true);
            });
        });
    }

    function endValue () {
        ignoreWhitespace.then(function () {
            if (scopes.length === 0) {
                return isEnd().then(checkEnd);
            }

            checkScope();
        });

        function checkEnd (atEnd) {
            if (!atEnd) {
                error(character(), 'EOF', 'current');
                return defer(value);
            }

            checkScope();
        }

        function checkScope () {
            var scope = scopes[scopes.length - 1];

            endScope.then(function (atScopeEnd) {
                if (!atScopeEnd) {
                    next.then(function (character) {
                        checkCharacter(character, ',');
                        defer(handlers[scope]);
                    });
                }
            });
        }
    }

    function string () {
        walkString(events.string).then(function () {
            next.then(defer.bind(null, endValue));
        });
    }

    function number (character) {
        var digits = character;

        walkDigits().then(addDigits.bind(null, checkDecimalPlace));

        function addDigits (step, remainingDigits) {
            digits += remainingDigits;
            next.then(step);
        }

        function checkDecimalPlace (character) {
            if (character === '.') {
                digits += character;
                return walkDigits().then(addDigits.bind(null, checkExponent));
            }

            next.then(checkExponent);
        }

        function checkExponent (character) {
            if (character === 'e' || character === 'E') {
                digits += character;
                return next.then(checkSign);
            }

            endNumber();
        }

        function checkSign (character) {
            if (character === '+' || character === '-') {
                digits += character;
            }

            walkDigits().then(function (remainingDigits) {
                digits += remainingDigits;
                endNumber();
            });
        }

        function endNumber () {
            emitter.emit(events.number, parseFloat(digits));
            defer(endValue);
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
                return resolve(digits);
            }

            next.then(function (character) {
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
            if (expectedCharacters.length === 0 || atEnd) {
                if (invalid) {
                    error(actual, expected, 'previous');
                } else if (expectedCharacters.length > 0) {
                    error('EOF', expectedCharacters.shift(), 'current');
                } else {
                    emitter.emit(events.literal, value);
                }

                return defer(endValue);
            }

            next.then(function (character) {
                actual = character;
                expected = expectedCharacters.shift();

                if (actual !== expected) {
                    invalid = true;
                    isEnd().then(step);
                }
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

function JsonStream (write, options) {
    if (!(this instanceof JsonStream)) {
        return new JsonStream();
    }

    this._write = function (chunk, encoding, callback) {
        if (check.function(encoding)) {
            callback = encoding;
        }

        // TODO: Check that Buffer.toString() always encodes to UTF-8
        write(chunk.toString(), 'utf8', callback);
    };

    return Writable.call(this, options);
}

util.inherits(JsonStream, Writable);

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

