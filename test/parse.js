'use strict';

var assert, mockery, spooks, modulePath;

assert = require('chai').assert;
mockery = require('mockery');
spooks = require('spooks');

modulePath = '../src/parse';

mockery.registerAllowable(modulePath);
mockery.registerAllowable('./events');

suite('parse:', function () {
    var log, results;

    setup(function () {
        log = {};
        results = {
            walk: [
                {
                    emitter: { on: spooks.fn({ name: 'on', log: log }) },
                    stream: {}
                }
            ]
        };

        mockery.enable({ useCleanCache: true });
        mockery.registerMock('./walk', spooks.fn({
            name: 'walk',
            log: log,
            results: results.walk
        }));
    });

    teardown(function () {
        mockery.deregisterMock('./walk');
        mockery.disable();

        log = results = undefined;
    });

    test('require does not throw', function () {
        assert.doesNotThrow(function () {
            require(modulePath);
        });
    });

    test('require returns function', function () {
        assert.isFunction(require(modulePath));
    });

    suite('require:', function () {
        var parse;

        setup(function () {
            parse = require(modulePath);
        });

        teardown(function () {
            parse = undefined;
        });

        test('parse expects two arguments', function () {
            assert.lengthOf(parse, 2);
        });

        test('parse does not throw when pipe method is defined on stream', function () {
            assert.doesNotThrow(function () {
                parse({ pipe: function () {} }, null);
            });
        });

        test('parse throws when no pipe method is defined on stream', function () {
            assert.throws(function () {
                parse({}, null);
            });
        });

        test('parse returns promise', function () {
            assert.instanceOf(parse({ pipe: function () {} }, null), Promise);
        });

        test('walk was not called', function () {
            assert.strictEqual(log.counts.walk, 0);
        });

        test('EventEmitter.on was not called', function () {
            assert.strictEqual(log.counts.on, 0);
        });

        suite('parse:', function () {
            var options;

            setup(function () {
                options = {};
                parse({ pipe: spooks.fn({ name: 'pipe', log: log }) }, options)
                    .then(spooks.fn({ name: 'resolve', log: log }))
                    .catch(spooks.fn({ name: 'reject', log: log }));
            });

            teardown(function () {
                options = undefined;
            });

            test('walk was called once', function () {
                assert.strictEqual(log.counts.walk, 1);
            });

            test('walk was called correctly', function () {
                assert.isUndefined(log.these.walk[0]);
                assert.lengthOf(log.args.walk[0], 1);
                assert.strictEqual(log.args.walk[0][0], options);
                assert.lengthOf(Object.keys(log.args.walk[0][0]), 0);
            });

            test('EventEmitter.on was called ten times', function () {
                assert.strictEqual(log.counts.on, 10);
                assert.strictEqual(log.these.on[0], results.walk[0].emitter);
                assert.strictEqual(log.these.on[1], results.walk[0].emitter);
                assert.strictEqual(log.these.on[2], results.walk[0].emitter);
                assert.strictEqual(log.these.on[3], results.walk[0].emitter);
                assert.strictEqual(log.these.on[4], results.walk[0].emitter);
                assert.strictEqual(log.these.on[5], results.walk[0].emitter);
                assert.strictEqual(log.these.on[6], results.walk[0].emitter);
                assert.strictEqual(log.these.on[7], results.walk[0].emitter);
                assert.strictEqual(log.these.on[8], results.walk[0].emitter);
                assert.strictEqual(log.these.on[9], results.walk[0].emitter);
            });

            test('EventEmitter.on was called correctly first time', function () {
                assert.lengthOf(log.args.on[0], 2);
                assert.strictEqual(log.args.on[0][0], 'arr');
                assert.isFunction(log.args.on[0][1]);
            });

            test('EventEmitter.on was called correctly second time', function () {
                assert.lengthOf(log.args.on[1], 2);
                assert.strictEqual(log.args.on[1][0], 'obj');
                assert.isFunction(log.args.on[1][1]);
                assert.notStrictEqual(log.args.on[1][1], log.args.on[0][1]);
            });

            test('EventEmitter.on was called correctly third time', function () {
                assert.lengthOf(log.args.on[2], 2);
                assert.strictEqual(log.args.on[2][0], 'pro');
                assert.isFunction(log.args.on[2][1]);
                assert.notStrictEqual(log.args.on[2][1], log.args.on[0][1]);
                assert.notStrictEqual(log.args.on[2][1], log.args.on[1][1]);
            });

            test('EventEmitter.on was called correctly fourth time', function () {
                assert.lengthOf(log.args.on[3], 2);
                assert.strictEqual(log.args.on[3][0], 'str');
                assert.isFunction(log.args.on[3][1]);
                assert.notStrictEqual(log.args.on[3][1], log.args.on[0][1]);
                assert.notStrictEqual(log.args.on[3][1], log.args.on[1][1]);
                assert.notStrictEqual(log.args.on[3][1], log.args.on[2][1]);
            });

            test('EventEmitter.on was called correctly fifth time', function () {
                assert.lengthOf(log.args.on[4], 2);
                assert.strictEqual(log.args.on[4][0], 'num');
                assert.isFunction(log.args.on[4][1]);
                assert.strictEqual(log.args.on[4][1], log.args.on[3][1]);
            });

            test('EventEmitter.on was called correctly sixth time', function () {
                assert.lengthOf(log.args.on[5], 2);
                assert.strictEqual(log.args.on[5][0], 'lit');
                assert.isFunction(log.args.on[5][1]);
                assert.strictEqual(log.args.on[5][1], log.args.on[3][1]);
            });

            test('EventEmitter.on was called correctly seventh time', function () {
                assert.lengthOf(log.args.on[6], 2);
                assert.strictEqual(log.args.on[6][0], 'end-arr');
                assert.isFunction(log.args.on[6][1]);
                assert.notStrictEqual(log.args.on[6][1], log.args.on[0][1]);
                assert.notStrictEqual(log.args.on[6][1], log.args.on[1][1]);
                assert.notStrictEqual(log.args.on[6][1], log.args.on[2][1]);
                assert.notStrictEqual(log.args.on[6][1], log.args.on[3][1]);
            });

            test('EventEmitter.on was called correctly eighth time', function () {
                assert.lengthOf(log.args.on[7], 2);
                assert.strictEqual(log.args.on[7][0], 'end-obj');
                assert.isFunction(log.args.on[7][1]);
                assert.strictEqual(log.args.on[7][1], log.args.on[6][1]);
            });

            test('EventEmitter.on was called correctly ninth time', function () {
                assert.lengthOf(log.args.on[8], 2);
                assert.strictEqual(log.args.on[8][0], 'end');
                assert.isFunction(log.args.on[8][1]);
                assert.notStrictEqual(log.args.on[8][1], log.args.on[0][1]);
                assert.notStrictEqual(log.args.on[8][1], log.args.on[1][1]);
                assert.notStrictEqual(log.args.on[8][1], log.args.on[2][1]);
                assert.notStrictEqual(log.args.on[8][1], log.args.on[3][1]);
                assert.notStrictEqual(log.args.on[8][1], log.args.on[6][1]);
            });

            test('EventEmitter.on was called correctly tenth time', function () {
                assert.lengthOf(log.args.on[9], 2);
                assert.strictEqual(log.args.on[9][0], 'err');
                assert.isFunction(log.args.on[9][1]);
                assert.notStrictEqual(log.args.on[9][1], log.args.on[0][1]);
                assert.notStrictEqual(log.args.on[9][1], log.args.on[1][1]);
                assert.notStrictEqual(log.args.on[9][1], log.args.on[2][1]);
                assert.notStrictEqual(log.args.on[9][1], log.args.on[3][1]);
                assert.notStrictEqual(log.args.on[9][1], log.args.on[6][1]);
                assert.notStrictEqual(log.args.on[9][1], log.args.on[8][1]);
            });

            suite('array event:', function () {
                setup(function () {
                    log.args.on[0][1]();
                });

                test('resolve was not called', function () {
                    assert.strictEqual(log.counts.resolve, 0);
                });

                suite('end event:', function () {
                    setup(function (done) {
                        log.args.on[8][1]();
                        setImmediate(done);
                    });

                    test('resolve was called once', function () {
                        assert.strictEqual(log.counts.resolve, 1);
                    });

                    test('resolve was called correctly', function () {
                        assert.isUndefined(log.these.resolve[0]);
                        assert.lengthOf(log.args.resolve[0], 1);
                        assert.isArray(log.args.resolve[0][0]);
                        assert.lengthOf(log.args.resolve[0][0], 0);
                    });

                    test('reject was not called', function () {
                        assert.strictEqual(log.counts.reject, 0);
                    });
                });

                suite('string event:', function () {
                    setup(function () {
                        log.args.on[3][1]('foo');
                    });

                    test('resolve was not called', function () {
                        assert.strictEqual(log.counts.resolve, 0);
                    });

                    suite('end event:', function () {
                        setup(function (done) {
                            log.args.on[8][1]();
                            setImmediate(done);
                        });

                        test('resolve was called once', function () {
                            assert.strictEqual(log.counts.resolve, 1);
                        });

                        test('resolve was called correctly', function () {
                            assert.lengthOf(log.args.resolve[0], 1);
                            assert.isArray(log.args.resolve[0][0]);
                            assert.lengthOf(log.args.resolve[0][0], 1);
                            assert.strictEqual(log.args.resolve[0][0][0], 'foo');
                        });
                    });

                    suite('string event:', function () {
                        setup(function () {
                            log.args.on[3][1]('bar');
                        });

                        test('resolve was not called', function () {
                            assert.strictEqual(log.counts.resolve, 0);
                        });

                        suite('end event:', function () {
                            setup(function (done) {
                                log.args.on[8][1]();
                                setImmediate(done);
                            });

                            test('resolve was called once', function () {
                                assert.strictEqual(log.counts.resolve, 1);
                            });

                            test('resolve was called correctly', function () {
                                assert.lengthOf(log.args.resolve[0][0], 2);
                                assert.strictEqual(log.args.resolve[0][0][0], 'foo');
                                assert.strictEqual(log.args.resolve[0][0][1], 'bar');
                            });
                        });
                    });

                    suite('array event:', function () {
                        setup(function () {
                            log.args.on[0][1]();
                        });

                        test('resolve was not called', function () {
                            assert.strictEqual(log.counts.resolve, 0);
                        });

                        suite('end event:', function () {
                            setup(function (done) {
                                log.args.on[8][1]();
                                setImmediate(done);
                            });

                            test('resolve was called once', function () {
                                assert.strictEqual(log.counts.resolve, 1);
                            });

                            test('resolve was called correctly', function () {
                                assert.lengthOf(log.args.resolve[0][0], 2);
                                assert.strictEqual(log.args.resolve[0][0][0], 'foo');
                                assert.isArray(log.args.resolve[0][0][1]);
                                assert.lengthOf(log.args.resolve[0][0][1], 0);
                            });
                        });

                        suite('string event:', function () {
                            setup(function () {
                                log.args.on[3][1]('bar');
                            });

                            test('resolve was not called', function () {
                                assert.strictEqual(log.counts.resolve, 0);
                            });

                            suite('end event:', function () {
                                setup(function (done) {
                                    log.args.on[8][1]();
                                    setImmediate(done);
                                });

                                test('resolve was called once', function () {
                                    assert.strictEqual(log.counts.resolve, 1);
                                });

                                test('resolve was called correctly', function () {
                                    assert.lengthOf(log.args.resolve[0][0], 2);
                                    assert.strictEqual(log.args.resolve[0][0][0], 'foo');
                                    assert.isArray(log.args.resolve[0][0][1]);
                                    assert.lengthOf(log.args.resolve[0][0][1], 1);
                                    assert.strictEqual(log.args.resolve[0][0][1][0], 'bar');
                                });
                            });

                            suite('string event:', function () {
                                setup(function () {
                                    log.args.on[3][1]('baz');
                                });

                                test('resolve was not called', function () {
                                    assert.strictEqual(log.counts.resolve, 0);
                                });

                                suite('end event:', function () {
                                    setup(function (done) {
                                        log.args.on[8][1]();
                                        setImmediate(done);
                                    });

                                    test('resolve was called once', function () {
                                        assert.strictEqual(log.counts.resolve, 1);
                                    });

                                    test('resolve was called correctly', function () {
                                        assert.lengthOf(log.args.resolve[0][0], 2);
                                        assert.strictEqual(log.args.resolve[0][0][0], 'foo');
                                        assert.isArray(log.args.resolve[0][0][1]);
                                        assert.lengthOf(log.args.resolve[0][0][1], 2);
                                        assert.strictEqual(log.args.resolve[0][0][1][0], 'bar');
                                        assert.strictEqual(log.args.resolve[0][0][1][1], 'baz');
                                    });
                                });
                            });

                            suite('endArray event:', function () {
                                setup(function () {
                                    log.args.on[6][1]();
                                });

                                suite('string event:', function () {
                                    setup(function () {
                                        log.args.on[3][1]('baz');
                                    });

                                    test('resolve was not called', function () {
                                        assert.strictEqual(log.counts.resolve, 0);
                                    });

                                    suite('end event:', function () {
                                        setup(function (done) {
                                            log.args.on[8][1]();
                                            setImmediate(done);
                                        });

                                        test('resolve was called once', function () {
                                            assert.strictEqual(log.counts.resolve, 1);
                                        });

                                        test('resolve was called correctly', function () {
                                            assert.lengthOf(log.args.resolve[0][0], 3);
                                            assert.strictEqual(log.args.resolve[0][0][0], 'foo');
                                            assert.isArray(log.args.resolve[0][0][1]);
                                            assert.lengthOf(log.args.resolve[0][0][1], 1);
                                            assert.strictEqual(log.args.resolve[0][0][1][0], 'bar');
                                            assert.strictEqual(log.args.resolve[0][0][2], 'baz');
                                        });
                                    });
                                });
                            });
                        });
                    });

                    suite('object event:', function () {
                        setup(function () {
                            log.args.on[1][1]();
                        });

                        test('resolve was not called', function () {
                            assert.strictEqual(log.counts.resolve, 0);
                        });

                        suite('end event:', function () {
                            setup(function (done) {
                                log.args.on[8][1]();
                                setImmediate(done);
                            });

                            test('resolve was called once', function () {
                                assert.strictEqual(log.counts.resolve, 1);
                            });

                            test('resolve was called correctly', function () {
                                assert.lengthOf(log.args.resolve[0][0], 2);
                                assert.strictEqual(log.args.resolve[0][0][0], 'foo');
                                assert.isObject(log.args.resolve[0][0][1]);
                                assert.lengthOf(Object.keys(log.args.resolve[0][0][1]), 0);
                            });
                        });

                        suite('property event:', function () {
                            setup(function () {
                                log.args.on[2][1]('bar');
                            });

                            suite('string event:', function () {
                                setup(function () {
                                    log.args.on[3][1]('baz');
                                });

                                test('resolve was not called', function () {
                                    assert.strictEqual(log.counts.resolve, 0);
                                });

                                suite('end event:', function () {
                                    setup(function (done) {
                                        log.args.on[8][1]();
                                        setImmediate(done);
                                    });

                                    test('resolve was called once', function () {
                                        assert.strictEqual(log.counts.resolve, 1);
                                    });

                                    test('resolve was called correctly', function () {
                                        assert.lengthOf(log.args.resolve[0][0], 2);
                                        assert.strictEqual(log.args.resolve[0][0][0], 'foo');
                                        assert.isObject(log.args.resolve[0][0][1]);
                                        assert.lengthOf(Object.keys(log.args.resolve[0][0][1]), 1);
                                        assert.strictEqual(log.args.resolve[0][0][1].bar, 'baz');
                                    });
                                });

                                suite('property event:', function () {
                                    setup(function () {
                                        log.args.on[2][1]('qux');
                                    });

                                    suite('string event:', function () {
                                        setup(function () {
                                            log.args.on[3][1]('wibble');
                                        });

                                        test('resolve was not called', function () {
                                            assert.strictEqual(log.counts.resolve, 0);
                                        });

                                        suite('end event:', function () {
                                            setup(function (done) {
                                                log.args.on[8][1]();
                                                setImmediate(done);
                                            });

                                            test('resolve was called once', function () {
                                                assert.strictEqual(log.counts.resolve, 1);
                                            });

                                            test('resolve was called correctly', function () {
                                                assert.lengthOf(log.args.resolve[0][0], 2);
                                                assert.strictEqual(log.args.resolve[0][0][0], 'foo');
                                                assert.isObject(log.args.resolve[0][0][1]);
                                                assert.lengthOf(Object.keys(log.args.resolve[0][0][1]), 2);
                                                assert.strictEqual(log.args.resolve[0][0][1].bar, 'baz');
                                                assert.strictEqual(log.args.resolve[0][0][1].qux, 'wibble');
                                            });
                                        });
                                    });
                                });

                                suite('endObject event:', function () {
                                    setup(function () {
                                        log.args.on[7][1]();
                                    });

                                    suite('string event:', function () {
                                        setup(function () {
                                            log.args.on[3][1]('wibble');
                                        });

                                        test('resolve was not called', function () {
                                            assert.strictEqual(log.counts.resolve, 0);
                                        });

                                        suite('end event:', function () {
                                            setup(function (done) {
                                                log.args.on[8][1]();
                                                setImmediate(done);
                                            });

                                            test('resolve was called once', function () {
                                                assert.strictEqual(log.counts.resolve, 1);
                                            });

                                            test('resolve was called correctly', function () {
                                                assert.lengthOf(log.args.resolve[0][0], 3);
                                                assert.strictEqual(log.args.resolve[0][0][0], 'foo');
                                                assert.isObject(log.args.resolve[0][0][1]);
                                                assert.lengthOf(Object.keys(log.args.resolve[0][0][1]), 1);
                                                assert.strictEqual(log.args.resolve[0][0][1].bar, 'baz');
                                                assert.strictEqual(log.args.resolve[0][0][2], 'wibble');
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });

                suite('error event:', function () {
                    setup(function () {
                        log.args.on[9][1]('foo');
                    });

                    test('reject was not called', function () {
                        assert.strictEqual(log.counts.reject, 0);
                    });

                    suite('end event:', function () {
                        setup(function (done) {
                            log.args.on[8][1]();
                            setImmediate(done);
                        });

                        test('reject was called once', function () {
                            assert.strictEqual(log.counts.reject, 1);
                        });

                        test('reject was called correctly', function () {
                            assert.isUndefined(log.these.reject[0]);
                            assert.lengthOf(log.args.reject[0], 1);
                            assert.strictEqual(log.args.reject[0][0], 'foo');
                        });
                    });

                    suite('error event:', function () {
                        setup(function () {
                            log.args.on[9][1]('bar');
                        });

                        test('reject was not called', function () {
                            assert.strictEqual(log.counts.reject, 0);
                        });

                        suite('end event:', function () {
                            setup(function (done) {
                                log.args.on[8][1]();
                                setImmediate(done);
                            });

                            test('reject was called once', function () {
                                assert.strictEqual(log.counts.reject, 1);
                            });

                            test('reject was called correctly', function () {
                                assert.strictEqual(log.args.reject[0][0], 'foo');
                            });
                        });
                    });
                });
            });

            suite('object event:', function () {
                setup(function () {
                    log.args.on[1][1]();
                });

                test('resolve was not called', function () {
                    assert.strictEqual(log.counts.resolve, 0);
                });

                suite('end event:', function () {
                    setup(function (done) {
                        log.args.on[8][1]();
                        setImmediate(done);
                    });

                    test('resolve was called once', function () {
                        assert.strictEqual(log.counts.resolve, 1);
                    });

                    test('resolve was called correctly', function () {
                        assert.isObject(log.args.resolve[0][0]);
                        assert.lengthOf(Object.keys(log.args.resolve[0][0]), 0);
                    });
                });
            });
        });
    });
});

