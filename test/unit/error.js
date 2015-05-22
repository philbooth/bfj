'use strict';

var assert, modulePath;

assert = require('chai').assert;
modulePath = '../../src/error';

suite('error:', function () {
    var log;

    setup(function () {
        log = {};
    });

    teardown(function () {
        log = undefined;
    });

    test('require does not throw', function () {
        assert.doesNotThrow(function () {
            require(modulePath);
        });
    });

    test('require returns object', function () {
        assert.isObject(require(modulePath));
    });

    suite('require:', function () {
        var error;

        setup(function () {
            error = require(modulePath);
        });

        teardown(function () {
            error = undefined;
        });

        test('error has create method', function () {
            assert.isFunction(error.create);
        });

        test('error has no other methods', function () {
            assert.lengthOf(Object.keys(error), 1);
        });

        test('create expects four arguments', function () {
            assert.lengthOf(error.create, 4);
        });

        test('create does not throw', function () {
            assert.doesNotThrow(function () {
                error.create();
            });
        });

        test('create returns Error', function () {
            assert.instanceOf(error.create(), Error);
        });

        suite('create:', function () {
            var created;

            setup(function () {
                created = error.create('foo', 'bar', 'baz', 'qux');
            });

            teardown(function () {
                created = undefined;
            });

            test('created has correct actual property', function () {
                assert.strictEqual(created.actual, 'foo');
            });

            test('created has correct expected property', function () {
                assert.strictEqual(created.expected, 'bar');
            });

            test('created has correct lineNumber property', function () {
                assert.strictEqual(created.lineNumber, 'baz');
            });

            test('created has correct columnNumber property', function () {
                assert.strictEqual(created.columnNumber, 'qux');
            });

            test('created has correct message property', function () {
                assert.strictEqual(created.message, 'JSON error: encountered `foo` at line baz, column qux where `bar` was expected.');
            });
        });
    });
});

