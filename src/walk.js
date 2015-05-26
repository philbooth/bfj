/*globals require, module, Promise, setImmediate, console */

'use strict';

var EventEmitter, check, error, events, terminators, escapes, time;

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
 *
 * @option debug:   Log debug messages to the console.
 **/
function initialise (stream, options) {
    var json, position, flags, scopes, handlers,
        resumeFn, emitter, discardThreshold;

    check.assert.instance(stream, require('stream').Readable);

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

    discardThreshold = options.discard || 16384;
    if (!options.debug) {
        debug = function () {};
    }
    time = require('./time')(options);

    stream.setEncoding('utf8');
    stream.on('data', readStream);
    stream.on('end', endStream);

    return emitter;

    function readStream (chunk) {
        time.begin('walk::readStream');
        debug('readStream');

        //if (!chunk || chunk.length === 0) {
        //    return;
        //}

        json += chunk;

        if (!flags.walk.begun) {
            flags.walk.begun = true;
            setImmediate(value);
            time.end('walk::readStream');
            return;
        }

        resume();
        time.end('walk::readStream');
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
        time.begin('walk::value');
        debug('value');

        awaitNonWhitespace()
            .then(next)
            .then(handleValue);
        time.end('walk::value');
    }

    function awaitNonWhitespace () {
        var resolve, reject;

        time.begin('walk::awaitNonWhitespace');
        debug('awaitNonWhitespace');

        wait();
        time.end('walk::awaitNonWhitespace');

        return new Promise(function (res, rej) {
            resolve = res;
            reject = rej;
        });

        function wait () {
            time.begin('walk::awaitNonWhitespace::wait');
            debug('awaitNonWhitespace::wait');

            awaitCharacter().then(step).catch(reject);
            time.end('walk::awaitNonWhitespace::wait');
        }

        function step () {
            time.begin('walk::awaitNonWhitespace::step');
            debug('awaitNonWhitespace::step');

            if (!isWhitespace(character())) {
                time.end('walk::awaitNonWhitespace::step');
                return resolve();
            }

            next().then(wait);
            time.end('walk::awaitNonWhitespace::step');
        }
    }

    function awaitCharacter () {
        var resolve, reject;

        time.begin('walk::awaitCharacter');
        debug('awaitCharacter');

        if (position.index < json.length) {
            time.end('walk::awaitCharacter');
            return Promise.resolve();
        }

        if (flags.stream.ended) {
            setImmediate(endWalk);
            time.end('walk::awaitCharacter');
            return Promise.reject();
        }

        resumeFn = after;
        time.end('walk::awaitCharacter');

        return new Promise(function (res, rej) {
            resolve = res;
            reject = rej;
        });

        function after () {
            time.begin('walk::awaitCharacter::after');
            debug('awaitCharacter::after');

            if (position.index < json.length) {
                time.end('walk::awaitCharacter::after');
                return resolve();
            }

            reject();

            if (flags.stream.ended) {
                setImmediate(endWalk);
            }
            time.end('walk::awaitCharacter::after');
        }
    }

    function next () {
        var resolve;

        time.begin('walk::next');
        debug('next');

        awaitCharacter().then(after);
        time.end('walk::next');

        return new Promise(function (r) {
            resolve = r;
        });

        function after () {
            var result;

            time.begin('walk::next::after');
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
            time.end('walk::next::after');
        }
    }

    function handleValue (character) {
        time.begin('walk::handleValue');
        debug('handleValue');

        switch (character) {
            case '[':
                time.end('walk::handleValue');
                return array();
            case '{':
                time.end('walk::handleValue');
                return object();
            case '"':
                time.end('walk::handleValue');
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
                time.end('walk::handleValue');
                return number(character);
            case 'f':
                time.end('walk::handleValue');
                return literalFalse();
            case 'n':
                time.end('walk::handleValue');
                return literalNull();
            case 't':
                time.end('walk::handleValue');
                return literalTrue();
            default:
                fail(character, 'value', 'previous');
                value();
        }
        time.end('walk::handleValue');
    }

    function array () {
        time.begin('walk::array');
        debug('array');

        scope(events.array, value);
        time.end('walk::array');
    }

    function scope (event, contentHandler) {
        time.begin('walk::scope');
        debug('scope');

        emitter.emit(event);
        scopes.push(event);
        endScope(event).then(contentHandler);
        time.end('walk::scope');
    }

    function endScope (scope) {
        var resolve;

        time.begin('walk::endScope');
        debug('endScope');

        awaitNonWhitespace().then(after).catch(endWalk);
        time.end('walk::endScope');

        return new Promise(function (r) {
            resolve = r;
        });

        function after () {
            time.begin('walk::endScope::after');
            debug('endScope::after');

            if (character() !== terminators[scope]) {
                time.end('walk::endScope::after');
                return resolve();
            }

            emitter.emit(events.endPrefix + scope);
            scopes.pop();

            next().then(endValue);
            time.end('walk::endScope::after');
        }
    }

    function endValue () {
        time.begin('walk::endValue');
        debug('endValue');

        awaitNonWhitespace().then(after).catch(endWalk);
        time.end('walk::endValue');

        function after () {
            time.begin('walk::endValue::after');
            if (scopes.length === 0) {
                fail(character(), 'EOF', 'current');
                time.end('walk::endValue::after');
                return setImmediate(value);
            }

            checkScope();
            time.end('walk::endValue::after');
        }

        function checkScope () {
            var scope;

            time.begin('walk::endValue::checkScope');
            debug('endValue::checkScope');

            scope = scopes[scopes.length - 1];

            endScope(scope).then(function () {
                time.begin('walk::endValue::checkScope::endScope');
                debug('endValue::checkScope::endScope');

                var handler = handlers[scope];

                if (checkCharacter(character(), ',', 'current')) {
                    next().then(handler);
                } else {
                    setImmediate(handler);
                }
                time.end('walk::endValue::checkScope::endScope');
            });
            time.end('walk::endValue::checkScope');
        }
    }

    function fail (actual, expected, positionKey) {
        time.begin('walk::fail');
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
        time.end('walk::fail');
    }

    function checkCharacter (character, expected, positionKey) {
        time.begin('walk::checkCharacter');
        debug('checkCharacter');

        if (character !== expected) {
            fail(character, expected, positionKey);
            time.end('walk::checkCharacter');
            return false;
        }

        time.end('walk::checkCharacter');
        return true;
    }

    function object () {
        time.begin('walk::object');
        debug('object');

        scope(events.object, property);
        time.end('walk::object');
    }

    function property () {
        time.begin('walk::property');
        debug('property');

        awaitNonWhitespace()
            .then(next)
            .then(propertyName);
        time.end('walk::property');
    }

    function propertyName (character) {
        time.begin('walk::propertyName');
        debug('propertyName');

        checkCharacter(character, '"', 'previous');

        walkString(events.property)
            .then(awaitNonWhitespace)
            .then(next)
            .then(propertyValue);
        time.end('walk::propertyName');
    }

    function propertyValue (character) {
        time.begin('walk::propertyValue');
        debug('propertyValue');

        checkCharacter(character, ':', 'previous');
        setImmediate(value);
        time.end('walk::propertyValue');
    }

    function walkString (event) {
        var isEscaping, string, resolve;

        time.begin('walk::walkString');
        debug('walkString');

        flags.walk.string = true;
        isEscaping = false;
        string = '';

        next().then(step);
        time.end('walk::walkString');

        return new Promise(function (r) {
            resolve = r;
        });

        function step (character) {
            time.begin('walk::walkString::step');
            debug('walkString::step');

            if (isEscaping) {
                isEscaping = false;
                time.end('walk::walkString::step');

                return escape(character).then(function (escaped) {
                    string += escaped;
                    next().then(step);
                });
            }

            if (character === '\\') {
                isEscaping = true;
                time.end('walk::walkString::step');
                return next().then(step);
            }

            if (character !== '"') {
                string += character;
                time.end('walk::walkString::step');
                return next().then(step);
            }

            flags.walk.string = false;
            emitter.emit(event, string);
            resolve();
            time.end('walk::walkString::step');
        }
    }

    function escape (character) {
        var promise, resolve;

        time.begin('walk::escape');
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

        time.end('walk::escape');
        return promise;
    }

    function escapeHex () {
        var hexits, resolve;

        time.begin('walk::escapeHex');
        debug('escapeHex');

        hexits = '';

        next().then(step.bind(null, 0));

        time.end('walk::escapeHex');
        return new Promise(function (r) {
            resolve = r;
        });

        function step (index, character) {
            time.begin('walk::escapeHex::step');
            debug('escapeHex::step');

            if (isHexit(character)) {
                hexits += character;
            }

            if (index < 3) {
                time.end('walk::escapeHex::step');
                return next().then(step.bind(null, index + 1));
            }

            if (hexits.length === 4) {
                time.end('walk::escapeHex::step');
                return resolve(String.fromCharCode(parseInt(hexits, 16)));
            }

            fail(character, 'hex digit', 'previous');

            resolve('\\u' + hexits + character);
            time.end('walk::escapeHex::step');
        }
    }

    function string () {
        time.begin('walk::string');
        debug('string');

        walkString(events.string).then(endValue);
        time.end('walk::string');
    }

    function number (firstCharacter) {
        var digits;

        time.begin('walk::number');
        debug('number');

        digits = firstCharacter;

        walkDigits().then(addDigits.bind(null, checkDecimalPlace));
        time.end('walk::number');

        function addDigits (step, result) {
            time.begin('walk::number::addDigits');
            debug('number::addDigits');

            digits += result.digits;

            if (result.atEnd) {
                time.end('walk::number::addDigits');
                return endNumber();
            }

            step();
            time.end('walk::number::addDigits');
        }

        function checkDecimalPlace () {
            time.begin('walk::number::checkDecimalPlace');
            debug('number::checkDecimalPlace');

            if (character() === '.') {
                time.end('walk::number::checkDecimalPlace');
                return next().then(function (character) {
                    digits += character;
                    walkDigits().then(addDigits.bind(null, checkExponent));
                });
            }

            checkExponent();
            time.end('walk::number::checkDecimalPlace');
        }

        function checkExponent () {
            time.begin('walk::number::checkExponent');
            debug('number::checkExponent');

            if (character() === 'e' || character() === 'E') {
                time.end('walk::number::checkExponent');
                return next().then(function (character) {
                    digits += character;
                    awaitCharacter()
                        .then(checkSign)
                        .catch(fail.bind(null, 'EOF', 'exponent', 'current'));
                });
            }

            endNumber();
            time.end('walk::number::checkExponent');
        }

        function checkSign () {
            time.begin('walk::number::checkSign');
            debug('number::checkExponent');

            if (character() === '+' || character() === '-') {
                time.end('walk::number::checkSign');
                return next().then(function (character) {
                    digits += character;
                    readExponent();
                });
            }

            readExponent();
            time.end('walk::number::checkSign');
        }

        function readExponent () {
            time.begin('walk::number::readExponent');
            debug('number::readExponent');

            walkDigits().then(addDigits.bind(null, endNumber));
            time.end('walk::number::readExponent');
        }

        function endNumber () {
            time.begin('walk::number::endNumber');
            debug('number::endNumber');

            emitter.emit(events.number, parseFloat(digits));
            setImmediate(endValue);
            time.end('walk::number::endNumber');
        }
    }

    function walkDigits () {
        var digits, resolve;

        time.begin('walk::walkDigits');
        debug('walkDigits');

        digits = '';

        wait();
        time.end('walk::walkDigits');

        return new Promise(function (r) {
            resolve = r;
        });

        function wait () {
            time.begin('walk::walkDigits::wait');
            debug('walkDigits::wait');

            awaitCharacter().then(step).catch(atEnd);
            time.end('walk::walkDigits::wait');
        }

        function step () {
            time.begin('walk::walkDigits::step');
            debug('walkDigits::step');

            if (isDigit(character())) {
                time.end('walk::walkDigits::step');
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
            time.end('walk::walkDigits::step');
        }

        function atEnd () {
            time.begin('walk::walkDigits::atEnd');
            debug('walkDigits::atEnd');

            resolve({
                digits: digits,
                atEnd: true
            });
            time.end('walk::walkDigits::atEnd');
        }
    }

    function literalFalse () {
        time.begin('walk::literalFalse');
        debug('literalFalse');

        literal([ 'a', 'l', 's', 'e' ], false);
        time.end('walk::literalFalse');
    }

    function literal (expectedCharacters, value) {
        var actual, expected, invalid;

        time.begin('walk::literal');
        debug('literal');

        wait();
        time.end('walk::literal');

        function wait () {
            time.begin('walk::literal::wait');
            debug('literal::wait');

            awaitCharacter().then(step).catch(atEnd);
            time.end('walk::literal::wait');
        }

        function step () {
            time.begin('walk::literal::step');
            debug('literal::step');

            if (invalid || expectedCharacters.length === 0) {
                time.end('walk::literal::step');
                return atEnd();
            }

            next().then(afterNext);
            time.end('walk::literal::step');
        }

        function atEnd () {
            time.begin('walk::literal::atEnd');
            debug('literal::atEnd');

            if (invalid) {
                fail(actual, expected, 'previous');
            } else if (expectedCharacters.length > 0) {
                fail('EOF', expectedCharacters.shift(), 'current');
            } else {
                done();
            }

            setImmediate(endValue);
            time.end('walk::literal::atEnd');
        }

        function afterNext (character) {
            time.begin('walk::literal::afterNext');
            debug('literal::afterNext');

            actual = character;
            expected = expectedCharacters.shift();

            if (actual !== expected) {
                invalid = true;
            }

            wait();
            time.end('walk::literal::afterNext');
        }

        function done () {
            time.begin('walk::literal::done');
            debug('literal::done');

            emitter.emit(events.literal, value);
            time.end('walk::literal::done');
        }
    }

    function literalNull () {
        time.begin('walk::literalNull');
        debug('literalNull');

        literal([ 'u', 'l', 'l' ], null);
        time.end('walk::literalNull');
    }

    function literalTrue () {
        time.begin('walk::literalTrue');
        debug('literalTrue');

        literal([ 'r', 'u', 'e' ], true);
        time.end('walk::literalTrue');
    }

    function endStream () {
        time.begin('walk::endStream');
        debug('endStream');

        flags.stream.ended = true;

        if (!flags.walk.begun) {
            setImmediate(endWalk);
            time.end('walk::endStream');
            return;
        }

        resume();
        time.end('walk::endStream');
    }

    function endWalk () {
        time.begin('walk::endWalk');
        debug('endWalk');

        if (flags.walk.ended) {
            time.end('walk::endWalk');
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
        time.end('walk::endWalk');
    }

    function resume () {
        time.begin('walk::resume');
        if (resumeFn) {
            setImmediate(resumeFn);
            resumeFn = undefined;
        }
        time.end('walk::resume');
    }
}

function isWhitespace (character) {
    time.begin('walk::isWhitespace');
    switch (character) {
        case ' ':
        case '\t':
        case '\r':
        case '\n':
            time.end('walk::isWhitespace');
            return true;
    }

    time.end('walk::isWhitespace');
    return false;
}

function isHexit (character) {
    time.begin('walk::isHexit');
    time.end('walk::isHexit');
    return isDigit(character) ||
           isInRange(character, 'A', 'F') ||
           isInRange(character, 'a', 'f');
}

function isDigit (character) {
    time.begin('walk::isDigit');
    time.end('walk::isDigit');
    return isInRange(character, '0', '9');
}

function isInRange (character, lower, upper) {
    time.begin('walk::isInRange');
    var code = character.charCodeAt(0);

    time.end('walk::isInRange');
    return code >= lower.charCodeAt(0) && code <= upper.charCodeAt(0);
}

