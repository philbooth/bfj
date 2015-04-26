'use strict';

var assert, modulePath;

assert = require('chai').assert;
modulePath = '../src/index';

suite('index:', function () {
    test('require does not throw', function () {
        assert.doesNotThrow(function () {
            require(modulePath);
        });
    });

    test('require returns object', function () {
        assert.isObject(require(modulePath));
    });

    suite('require:', function () {
        var index;

        setup(function () {
            index = require(modulePath);
        });

        teardown(function () {
            index = undefined;
        });

        test('walk function is exported', function () {
            assert.isFunction(index.walk);
        });

        test('parse function is exported', function () {
            assert.isFunction(index.parse);
        });

        test('read function is exported', function () {
            assert.isFunction(index.read);
        });

        test('eventify function is exported', function () {
            assert.isFunction(index.eventify);
        });

        test('events object is exported', function () {
            assert.isObject(index.events);
        });
    });
});

