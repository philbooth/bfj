/*globals require, module, setImmediate, setTimeout, console */

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
        console.log('handleValue: ' + character);

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

        defer(step.bind(null, character()));

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
        console.log('isEnd');

        var resolve;

        defer(step);

        return new Promise(function (r) {
            resolve = r;
        });

        function step () {
            console.log('isEnd::step: ' + walking);

            if (walking) {
                return resolve(position.index === json.length);
            }

            wait(step);
        }
    }

    function wait (after) {
        console.log('wait: ' + after);

        setTimeout(after, delay || 1000);
    }

    function end () {
        console.log('end');

        if (!finished) {
            console.log('end: not finished');
            walking = false;
            return;
        }

        if (insideString) {
            console.log('end: inside string');
            error('EOF', '"', 'current');
        }

        while (scopes.length > 0) {
            console.log('end: ' + scopes.length + ' unterminated scopes');
            error('EOF', terminators[scopes.pop()], 'current');
        }

        console.log('end: emitting event');
        emitter.emit(events.end);
    }

    function error (actual, expected, positionKey) {
        console.log('error: ' + actual + ', ' + expected + ', ' + positionKey);

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
                defer(contentHandler);
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
                defer(endValue);
                resolve(true);
            });
        });
    }

    function object () {
        scope(events.object, property);
    }

    function property () {
        console.log('property');

        ignoreWhitespace().then(function () {
            next().then(propertyName);
        });
    }

    function propertyName (character) {
        console.log('propertyName: ' + character);

        checkCharacter(character, '"');
        walkString(events.property).then(function () {
            ignoreWhitespace().then(function () {
                next().then(propertyValue);
            });
        });
    }

    function propertyValue (character) {
        console.log('propertyValue: ' + character);

        checkCharacter(character, ':');
        defer(value);
    }

    function walkString (event) {
        console.log('walkString: ' + event);

        var quoting, string;

        insideString = true;
        quoting = false;
        string = '';

        next().then(step);

        function step (character) {
            console.log('walkString::step: ' + character);

            if (quoting) {
                quoting = false;

                return next().then(function (character) {
                    escape(character).then(function (escaped) {
                        string += escaped;
                        next().then(step);
                    });
                });
            }

            if (character === '\\') {
                quoting = true;
                return next().then(step);
            }

            if (character !== '"') {
                return next().then(function (character) {
                    string += character;
                    next().then(step);
                });
            }

            insideString = false;
            emitter.emit(event, string);
        }
    }

    function escape (character) {
        console.log('escape: ' + character);

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
        console.log('escapeHex');

        var hexits, resolve;

        hexits = '';

        next().then(step);

        return new Promise(function (r) {
            resolve = r;
        });

        function step (index, character) {
            console.log('escapeHex::step: ' + index + ', ' + character);

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

            next().then(step.bind(null, index + 1));
        }
    }

    function checkCharacter (character, expected) {
        console.log('checkCharacter: ' + character + ', ' + expected);

        if (character !== expected) {
            return error(character, expected, 'previous');
        }
    }

    function endValue () {
        console.log('endValue');

        ignoreWhitespace().then(function () {
            if (scopes.length === 0) {
                return isEnd().then(checkEnd);
            }

            checkScope();
        });

        function checkEnd (atEnd) {
            console.log('checkEnd: ' + atEnd);

            if (!atEnd) {
                error(character(), 'EOF', 'current');
                return defer(value);
            }

            checkScope();
        }

        function checkScope () {
            console.log('checkScope');

            var scope = scopes[scopes.length - 1];

            endScope().then(function (atScopeEnd) {
                if (!atScopeEnd) {
                    next().then(function (character) {
                        checkCharacter(character, ',');
                        defer(handlers[scope]);
                    });
                }
            });
        }
    }

    function string () {
        console.log('string');

        walkString(events.string).then(function () {
            next().then(defer.bind(null, endValue));
        });
    }

    function number (character) {
        console.log('number: ' + character);

        var digits = character;

        walkDigits().then(addDigits.bind(null, checkDecimalPlace));

        function addDigits (step, remainingDigits) {
            console.log('number::addDigits: ' + typeof step + ', ' + remainingDigits);

            digits += remainingDigits;
            next().then(step);
        }

        function checkDecimalPlace (character) {
            console.log('number::checkDecimalPlace: ' + character);

            if (character === '.') {
                digits += character;
                return walkDigits().then(addDigits.bind(null, checkExponent));
            }

            next().then(checkExponent);
        }

        function checkExponent (character) {
            console.log('number::checkExponent: ' + character);

            if (character === 'e' || character === 'E') {
                digits += character;
                return next().then(checkSign);
            }

            endNumber();
        }

        function checkSign (character) {
            console.log('checkSign: ' + character);

            if (character === '+' || character === '-') {
                digits += character;
            }

            walkDigits().then(function (remainingDigits) {
                digits += remainingDigits;
                endNumber();
            });
        }

        function endNumber () {
            console.log('endNumber');

            emitter.emit(events.number, parseFloat(digits));
            defer(endValue);
        }
    }

    function walkDigits () {
        console.log('walkDigits');

        var digits, resolve;

        digits = '';

        isEnd().then(step);

        return new Promise(function (r) {
            resolve = r;
        });

        function step (atEnd) {
            console.log('walkDigits::step: ' + atEnd);

            if (atEnd || !isDigit(character())) {
                return resolve(digits);
            }

            next().then(function (character) {
                digits += character;
                isEnd().then(step);
            });
        }
    }

    function literalFalse () {
        console.log('literalFalse');

        literal([ 'a', 'l', 's', 'e' ], false);
    }

    function literal (expectedCharacters, value) {
        console.log('literal: ' + expectedCharacters.join('') + ', ' + value);

        var actual, expected, invalid;

        isEnd().then(step);

        function step (atEnd) {
            console.log('literal::step: ' + atEnd);

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

            next().then(function (character) {
                console.log('literal::character: ' + character);

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
        console.log('literalNull');

        literal([ 'u', 'l', 'l' ], null);
    }

    function literalTrue () {
        console.log('literalTrue');

        literal([ 'r', 'u', 'e' ], true);
    }
}

function JsonStream (write) {
    console.log('JsonStream: ' + typeof write);

    if (!(this instanceof JsonStream)) {
        return new JsonStream();
    }

    this._write = function (chunk, encoding, callback) {
        console.log('JsonStream::_write: ' + chunk + ', ' + encoding + ', ' + typeof callback);

        write(chunk.toString());
        callback();
    };

    return Writable.call(this);
}

util.inherits(JsonStream, Writable);

function defer (fn) {
    console.log('defer: ' + typeof fn);

    setImmediate(function () {
        try {
            fn();
        } catch (error) {
            /*jshint noempty:false */
        }
    });
}

function isWhitespace (character) {
    console.log('isWhitespace: ' + character);

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
    console.log('isHexit: ' + character);

    return isDigit(character) ||
           isInRange(character, 'A', 'F') ||
           isInRange(character, 'a', 'f');
}

function isDigit (character) {
    console.log('isDigit: ' + character);

    return isInRange(character, '0', '9');
}

function isInRange (character, lower, upper) {
    console.log('isInRange: ' + character + ', ' + lower + ', ' + upper);

    var code = character.charCodeAt(0);

    return code >= lower.charCodeAt(0) && code <= upper.charCodeAt(0);
}

