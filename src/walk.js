/*globals require, module, Promise, setImmediate, console */

'use strict';

var EventEmitter, JsonStream, error, events, terminators, escapes;

EventEmitter = require('events').EventEmitter;
JsonStream = require('./stream');
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
 * Initialises an asynchronous JSON walker and returns an object
 * { stream, emitter }, where `stream` is a Writable instance
 * that represents the incoming JSON stream and `emitter` is an
 * EventEmitter instance that represents the outgoing JSON token
 * events.
 *
 * @option discard: The number of characters to process before
 *                  discarding the processed characters to save
 *                  memory. The default value is `16384`.
 *
 * @option debug:   Log debug messages to the console.
 **/
function initialise (options) {
    var json, position, flags, scopes, handlers,
        resumeFn, emitter, stream, discardThreshold;

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

    discardThreshold = options.discard || 16384;
    if (!options.debug) {
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
            setImmediate(value);
        }

        resume();
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
        debugFlag('walk', 'string', 'ws');
        debugFlag('walk', 'ended', 'wx');

        return result;

        function debugFlag (type, name, abbreviation) {
            if (flags[type][name]) {
                result += ' ' + abbreviation;
            }
        }
    }

    function value () {
        debug('value');

        awaitNonWhitespace()
            .then(next)
            .then(handleValue);
    }

    function awaitNonWhitespace () {
        var resolve, reject;

        debug('awaitNonWhitespace');

        wait();

        return new Promise(function (res, rej) {
            resolve = res;
            reject = rej;
        });

        function wait () {
            debug('awaitNonWhitespace::wait');

            awaitCharacter().then(step).catch(reject);
        }

        function step () {
            debug('awaitNonWhitespace::step');

            if (!isWhitespace(character())) {
                return resolve();
            }

            next().then(wait);
        }
    }

    function awaitCharacter () {
        var resolve, reject;

        debug('awaitCharacter');

        if (position.index < json.length) {
            return Promise.resolve();
        }

        if (flags.stream.ended) {
            setImmediate(endWalk);
            return Promise.reject();
        }

        resumeFn = after;

        return new Promise(function (res, rej) {
            resolve = res;
            reject = rej;
        });

        function after () {
            debug('awaitCharacter::after');

            if (position.index < json.length) {
                return resolve();
            }

            reject();

            if (flags.stream.ended) {
                setImmediate(endWalk);
            }
        }
    }

    function next () {
        var resolve;

        debug('next');

        awaitCharacter().then(after);

        return new Promise(function (r) {
            resolve = r;
        });

        function after () {
            var result;

            debug('next::after');

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

            if (position.index === discardThreshold) {
                json = json.substr(position.index);
                position.index = 0;
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
        endScope(event).then(contentHandler);
    }

    function endScope (scope) {
        var resolve;

        debug('endScope');

        awaitNonWhitespace().then(after).catch(endWalk);

        return new Promise(function (r) {
            resolve = r;
        });

        function after () {
            debug('endScope::after');

            if (character() !== terminators[scope]) {
                return resolve();
            }

            emitter.emit(events.endPrefix + scope);
            scopes.pop();

            next().then(endValue);
        }
    }

    function endValue () {
        debug('endValue');

        awaitNonWhitespace().then(after).catch(endWalk);

        function after () {
            if (scopes.length === 0) {
                fail(character(), 'EOF', 'current');
                return setImmediate(value);
            }

            checkScope();
        }

        function checkScope () {
            var scope;

            debug('endValue::checkScope');

            scope = scopes[scopes.length - 1];

            endScope(scope).then(function () {
                debug('endValue::checkScope::endScope');

                var handler = handlers[scope];

                if (checkCharacter(character(), ',', 'current')) {
                    next().then(handler);
                } else {
                    setImmediate(handler);
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

        awaitNonWhitespace()
            .then(next)
            .then(propertyName);
    }

    function propertyName (character) {
        debug('propertyName');

        checkCharacter(character, '"', 'previous');

        walkString(events.property)
            .then(awaitNonWhitespace)
            .then(next)
            .then(propertyValue);
    }

    function propertyValue (character) {
        debug('propertyValue');

        checkCharacter(character, ':', 'previous');
        setImmediate(value);
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
                    awaitCharacter()
                        .then(checkSign)
                        .catch(fail.bind(null, 'EOF', 'exponent', 'current'));
                });
            }

            endNumber();
        }

        function checkSign () {
            debug('number::checkExponent');

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
            setImmediate(endValue);
        }
    }

    function walkDigits () {
        var digits, resolve;

        debug('walkDigits');

        digits = '';

        wait();

        return new Promise(function (r) {
            resolve = r;
        });

        function wait () {
            debug('walkDigits::wait');

            awaitCharacter().then(step).catch(atEnd);
        }

        function step () {
            debug('walkDigits::step');

            if (isDigit(character())) {
                return next().then(function (character) {
                    debug('walkDigits::step::next');

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
            debug('walkDigits::atEnd');

            resolve({
                digits: digits,
                atEnd: true
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

        wait();

        function wait () {
            debug('literal::wait');

            awaitCharacter().then(step).catch(atEnd);
        }

        function step () {
            debug('literal::step');

            if (invalid || expectedCharacters.length === 0) {
                return atEnd();
            }

            next().then(afterNext);
        }

        function atEnd () {
            debug('literal::atEnd');

            if (invalid) {
                fail(actual, expected, 'previous');
            } else if (expectedCharacters.length > 0) {
                fail('EOF', expectedCharacters.shift(), 'current');
            } else {
                done();
            }

            setImmediate(endValue);
        }

        function afterNext (character) {
            debug('literal::afterNext');

            actual = character;
            expected = expectedCharacters.shift();

            if (actual !== expected) {
                invalid = true;
            }

            wait();
        }

        function done () {
            debug('literal::done');

            emitter.emit(events.literal, value);
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

    function endStream () {
        debug('endStream');

        flags.stream.ended = true;

        if (!flags.walk.begun) {
            setImmediate(endWalk);
            return;
        }

        resume();
    }

    function endWalk () {
        debug('endWalk');

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

    function resume () {
        if (resumeFn) {
            setImmediate(resumeFn);
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

