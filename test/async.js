'use strict';

var assert, modulePath;

assert = require('chai').assert;
modulePath = '../src/async';

suite('async:', function () {
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
        var async;

        setup(function () {
            async = require(modulePath);
        });

        teardown(function () {
            async = undefined;
        });

        test('async has initialise method', function () {
            assert.isFunction(async.initialise);
        });

        test('async has no other methods', function () {
            assert.lengthOf(Object.keys(async), 1);
        });

        test('initialise throws without options', function () {
            assert.throws(function () {
                async.initialise();
            });
        });

        test('initialise does not throw with empty options', function () {
            assert.doesNotThrow(function () {
                async.initialise({});
            });
        });

        test('initialise returns object', function () {
            assert.isObject(async.initialise({}));
        });

        suite('initialise with 100 ms delay option:', function () {
            var initialised;

            setup(function () {
                initialised = async.initialise({ delay: 100 });
            });

            teardown(function () {
                initialised = undefined;
            });

            test('initialised has defer method', function () {
                assert.isFunction(initialised.defer);
            });

            test('initialised has delay method', function () {
                assert.isFunction(initialised.delay);
            });

            test('initialised has no other methods', function () {
                assert.lengthOf(Object.keys(initialised), 2);
            });

            test('defer expects one argument', function () {
                assert.lengthOf(initialised.defer, 1);
            });

            test('defer does not throw with function', function (done) {
                assert.doesNotThrow(function () {
                    initialised.defer(done);
                });
            });

            test('delay expects one argument', function () {
                assert.lengthOf(initialised.delay, 1);
            });

            test('delay does not throw with function', function (done) {
                assert.doesNotThrow(function () {
                    initialised.delay(done);
                });
            });

            suite('defer', function () {
                var begin, end;

                setup(function (done) {
                    begin = Date.now();
                    initialised.defer(function () {
                        end = Date.now();
                        done();
                    });
                });

                test('deferred function was called within 10 ms', function () {
                    assert.isTrue(begin <= end);
                    assert.isTrue(begin >= end - 10);
                });
            });

            suite('delay', function () {
                var begin, end;

                setup(function (done) {
                    begin = Date.now();
                    initialised.delay(function () {
                        end = Date.now();
                        done();
                    });
                });

                test('delayed function was called after 100 ms', function () {
                    assert.isTrue(begin <= end - 100);
                    assert.isTrue(begin >= end - 110);
                });
            });
        });
    });
});

