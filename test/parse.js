'use strict';

var assert, mockery, spooks, modulePath;

assert = require('chai').assert;
mockery = require('mockery');
spooks = require('spooks');

modulePath = '../src/parse';

mockery.registerAllowable(modulePath);
mockery.registerAllowable('check-types');
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

        // TODO: PHIL, YOU ARE HERE

        test('walk was not called', function () {
            assert.strictEqual(log.counts.walk, 0);
        });

        test('EventEmitter.on was not called', function () {
            assert.strictEqual(log.counts.on, 0);
        });

/*        suite('parse async:', function () {
            var callback, result;

            setup(function () {
                callback = spooks.fn({ name: 'callback', log: log });
                result = parse({ pipe: spooks.fn({ name: 'pipe', log: log }) }, callback);
            });

            teardown(function () {
                callback = result = undefined;
            });

            test('result was undefined', function () {
                assert.isUndefined(result);
            });

            test('walk was called once', function () {
                assert.strictEqual(log.counts.walk, 1);
            });

            test('walk was called correctly', function () {
                assert.isUndefined(log.these.walk[0]);
                assert.lengthOf(log.args.walk[0], 1);
                assert.strictEqual(log.args.walk[0][0], 'foo');
            });

            test('EventEmitter.on was called ten times', function () {
                assert.strictEqual(log.counts.on, 10);
                assert.strictEqual(log.these.on[0], results.walk[0]);
                assert.strictEqual(log.these.on[1], results.walk[0]);
                assert.strictEqual(log.these.on[2], results.walk[0]);
                assert.strictEqual(log.these.on[3], results.walk[0]);
                assert.strictEqual(log.these.on[4], results.walk[0]);
                assert.strictEqual(log.these.on[5], results.walk[0]);
                assert.strictEqual(log.these.on[6], results.walk[0]);
                assert.strictEqual(log.these.on[7], results.walk[0]);
                assert.strictEqual(log.these.on[8], results.walk[0]);
                assert.strictEqual(log.these.on[9], results.walk[0]);
            });

            test('EventEmitter.on was called correctly', function () {
                assert.lengthOf(log.args.on[0], 2);
                assert.strictEqual(log.args.on[0][0], 'arr');
                assert.isFunction(log.args.on[0][1]);

                assert.lengthOf(log.args.on[1], 2);
                assert.strictEqual(log.args.on[1][0], 'obj');
                assert.isFunction(log.args.on[1][1]);
                assert.notStrictEqual(log.args.on[1][1], log.args.on[0][1]);

                assert.lengthOf(log.args.on[2], 2);
                assert.strictEqual(log.args.on[2][0], 'pro');
                assert.isFunction(log.args.on[2][1]);
                assert.notStrictEqual(log.args.on[2][1], log.args.on[0][1]);
                assert.notStrictEqual(log.args.on[2][1], log.args.on[1][1]);

                assert.lengthOf(log.args.on[3], 2);
                assert.strictEqual(log.args.on[3][0], 'str');
                assert.isFunction(log.args.on[3][1]);
                assert.notStrictEqual(log.args.on[3][1], log.args.on[0][1]);
                assert.notStrictEqual(log.args.on[3][1], log.args.on[1][1]);
                assert.notStrictEqual(log.args.on[3][1], log.args.on[2][1]);

                assert.lengthOf(log.args.on[4], 2);
                assert.strictEqual(log.args.on[4][0], 'num');
                assert.isFunction(log.args.on[4][1]);
                assert.strictEqual(log.args.on[4][1], log.args.on[3][1]);

                assert.lengthOf(log.args.on[5], 2);
                assert.strictEqual(log.args.on[5][0], 'lit');
                assert.isFunction(log.args.on[5][1]);
                assert.strictEqual(log.args.on[5][1], log.args.on[3][1]);

                assert.lengthOf(log.args.on[6], 2);
                assert.strictEqual(log.args.on[6][0], 'end-arr');
                assert.isFunction(log.args.on[6][1]);
                assert.notStrictEqual(log.args.on[6][1], log.args.on[0][1]);
                assert.notStrictEqual(log.args.on[6][1], log.args.on[1][1]);
                assert.notStrictEqual(log.args.on[6][1], log.args.on[2][1]);
                assert.notStrictEqual(log.args.on[6][1], log.args.on[3][1]);

                assert.lengthOf(log.args.on[7], 2);
                assert.strictEqual(log.args.on[7][0], 'end-obj');
                assert.isFunction(log.args.on[7][1]);
                assert.strictEqual(log.args.on[7][1], log.args.on[6][1]);

                assert.lengthOf(log.args.on[8], 2);
                assert.strictEqual(log.args.on[8][0], 'end');
                assert.isFunction(log.args.on[8][1]);
                assert.notStrictEqual(log.args.on[8][1], log.args.on[0][1]);
                assert.notStrictEqual(log.args.on[8][1], log.args.on[1][1]);
                assert.notStrictEqual(log.args.on[8][1], log.args.on[2][1]);
                assert.notStrictEqual(log.args.on[8][1], log.args.on[3][1]);
                assert.notStrictEqual(log.args.on[8][1], log.args.on[6][1]);

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

                test('callback was not called', function () {
                    assert.strictEqual(log.counts.callback, 0);
                });

                suite('end event:', function () {
                    setup(function () {
                        log.args.on[8][1]();
                    });

                    test('callback was called once', function () {
                        assert.strictEqual(log.counts.callback, 1);
                    });

                    test('callback was called correctly', function () {
                        assert.isUndefined(log.these.callback[0]);
                        assert.lengthOf(log.args.callback[0], 2);
                        assert.isUndefined(log.args.callback[0][0]);
                        assert.isArray(log.args.callback[0][1]);
                        assert.lengthOf(log.args.callback[0][1], 0);
                    });
                });

                suite('string event:', function () {
                    setup(function () {
                        log.args.on[3][1]('foo');
                    });

                    test('callback was not called', function () {
                        assert.strictEqual(log.counts.callback, 0);
                    });

                    suite('end event:', function () {
                        setup(function () {
                            log.args.on[8][1]();
                        });

                        test('callback was called once', function () {
                            assert.strictEqual(log.counts.callback, 1);
                        });

                        test('callback was called correctly', function () {
                            assert.isUndefined(log.these.callback[0]);
                            assert.lengthOf(log.args.callback[0], 2);
                            assert.isUndefined(log.args.callback[0][0]);
                            assert.isArray(log.args.callback[0][1]);
                            assert.lengthOf(log.args.callback[0][1], 1);
                            assert.strictEqual(log.args.callback[0][1][0], 'foo');
                        });
                    });

                    suite('string event:', function () {
                        setup(function () {
                            log.args.on[3][1]('bar');
                        });

                        test('callback was not called', function () {
                            assert.strictEqual(log.counts.callback, 0);
                        });

                        suite('end event:', function () {
                            setup(function () {
                                log.args.on[8][1]();
                            });

                            test('callback was called once', function () {
                                assert.strictEqual(log.counts.callback, 1);
                            });

                            test('callback was called correctly', function () {
                                assert.isArray(log.args.callback[0][1]);
                                assert.lengthOf(log.args.callback[0][1], 2);
                                assert.strictEqual(log.args.callback[0][1][0], 'foo');
                                assert.strictEqual(log.args.callback[0][1][1], 'bar');
                            });
                        });
                    });

                    suite('array event:', function () {
                        setup(function () {
                            log.args.on[0][1]();
                        });

                        test('callback was not called', function () {
                            assert.strictEqual(log.counts.callback, 0);
                        });

                        suite('end event:', function () {
                            setup(function () {
                                log.args.on[8][1]();
                            });

                            test('callback was called once', function () {
                                assert.strictEqual(log.counts.callback, 1);
                            });

                            test('callback was called correctly', function () {
                                assert.lengthOf(log.args.callback[0][1], 2);
                                assert.strictEqual(log.args.callback[0][1][0], 'foo');
                                assert.isArray(log.args.callback[0][1][1]);
                                assert.lengthOf(log.args.callback[0][1][1], 0);
                            });
                        });

                        suite('string event:', function () {
                            setup(function () {
                                log.args.on[3][1]('bar');
                            });

                            test('callback was not called', function () {
                                assert.strictEqual(log.counts.callback, 0);
                            });

                            suite('end event:', function () {
                                setup(function () {
                                    log.args.on[8][1]();
                                });

                                test('callback was called once', function () {
                                    assert.strictEqual(log.counts.callback, 1);
                                });

                                test('callback was called correctly', function () {
                                    assert.lengthOf(log.args.callback[0][1], 2);
                                    assert.strictEqual(log.args.callback[0][1][0], 'foo');
                                    assert.isArray(log.args.callback[0][1][1]);
                                    assert.lengthOf(log.args.callback[0][1][1], 1);
                                    assert.strictEqual(log.args.callback[0][1][1][0], 'bar');
                                });
                            });

                            suite('string event:', function () {
                                setup(function () {
                                    log.args.on[3][1]('baz');
                                });

                                test('callback was not called', function () {
                                    assert.strictEqual(log.counts.callback, 0);
                                });

                                suite('end event:', function () {
                                    setup(function () {
                                        log.args.on[8][1]();
                                    });

                                    test('callback was called once', function () {
                                        assert.strictEqual(log.counts.callback, 1);
                                    });

                                    test('callback was called correctly', function () {
                                        assert.lengthOf(log.args.callback[0][1], 2);
                                        assert.strictEqual(log.args.callback[0][1][0], 'foo');
                                        assert.isArray(log.args.callback[0][1][1]);
                                        assert.lengthOf(log.args.callback[0][1][1], 2);
                                        assert.strictEqual(log.args.callback[0][1][1][0], 'bar');
                                        assert.strictEqual(log.args.callback[0][1][1][1], 'baz');
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

                                    test('callback was not called', function () {
                                        assert.strictEqual(log.counts.callback, 0);
                                    });

                                    suite('end event:', function () {
                                        setup(function () {
                                            log.args.on[8][1]();
                                        });

                                        test('callback was called once', function () {
                                            assert.strictEqual(log.counts.callback, 1);
                                        });

                                        test('callback was called correctly', function () {
                                            assert.lengthOf(log.args.callback[0][1], 3);
                                            assert.strictEqual(log.args.callback[0][1][0], 'foo');
                                            assert.isArray(log.args.callback[0][1][1]);
                                            assert.lengthOf(log.args.callback[0][1][1], 1);
                                            assert.strictEqual(log.args.callback[0][1][1][0], 'bar');
                                            assert.strictEqual(log.args.callback[0][1][2], 'baz');
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

                        test('callback was not called', function () {
                            assert.strictEqual(log.counts.callback, 0);
                        });

                        suite('end event:', function () {
                            setup(function () {
                                log.args.on[8][1]();
                            });

                            test('callback was called once', function () {
                                assert.strictEqual(log.counts.callback, 1);
                            });

                            test('callback was called correctly', function () {
                                assert.lengthOf(log.args.callback[0][1], 2);
                                assert.strictEqual(log.args.callback[0][1][0], 'foo');
                                assert.isObject(log.args.callback[0][1][1]);
                                assert.lengthOf(Object.keys(log.args.callback[0][1][1]), 0);
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

                                test('callback was not called', function () {
                                    assert.strictEqual(log.counts.callback, 0);
                                });

                                suite('end event:', function () {
                                    setup(function () {
                                        log.args.on[8][1]();
                                    });

                                    test('callback was called once', function () {
                                        assert.strictEqual(log.counts.callback, 1);
                                    });

                                    test('callback was called correctly', function () {
                                        assert.lengthOf(log.args.callback[0][1], 2);
                                        assert.strictEqual(log.args.callback[0][1][0], 'foo');
                                        assert.isObject(log.args.callback[0][1][1]);
                                        assert.lengthOf(Object.keys(log.args.callback[0][1][1]), 1);
                                        assert.strictEqual(log.args.callback[0][1][1].bar, 'baz');
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

                                        test('callback was not called', function () {
                                            assert.strictEqual(log.counts.callback, 0);
                                        });

                                        suite('end event:', function () {
                                            setup(function () {
                                                log.args.on[8][1]();
                                            });

                                            test('callback was called once', function () {
                                                assert.strictEqual(log.counts.callback, 1);
                                            });

                                            test('callback was called correctly', function () {
                                                assert.lengthOf(log.args.callback[0][1], 2);
                                                assert.strictEqual(log.args.callback[0][1][0], 'foo');
                                                assert.isObject(log.args.callback[0][1][1]);
                                                assert.lengthOf(Object.keys(log.args.callback[0][1][1]), 2);
                                                assert.strictEqual(log.args.callback[0][1][1].bar, 'baz');
                                                assert.strictEqual(log.args.callback[0][1][1].qux, 'wibble');
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

                                        test('callback was not called', function () {
                                            assert.strictEqual(log.counts.callback, 0);
                                        });

                                        suite('end event:', function () {
                                            setup(function () {
                                                log.args.on[8][1]();
                                            });

                                            test('callback was called once', function () {
                                                assert.strictEqual(log.counts.callback, 1);
                                            });

                                            test('callback was called correctly', function () {
                                                assert.lengthOf(log.args.callback[0][1], 3);
                                                assert.strictEqual(log.args.callback[0][1][0], 'foo');
                                                assert.isObject(log.args.callback[0][1][1]);
                                                assert.lengthOf(Object.keys(log.args.callback[0][1][1]), 1);
                                                assert.strictEqual(log.args.callback[0][1][1].bar, 'baz');
                                                assert.strictEqual(log.args.callback[0][1][2], 'wibble');
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

                    test('callback was not called', function () {
                        assert.strictEqual(log.counts.callback, 0);
                    });

                    suite('end event:', function () {
                        setup(function () {
                            log.args.on[8][1]();
                        });

                        test('callback was called once', function () {
                            assert.strictEqual(log.counts.callback, 1);
                        });

                        test('callback was called correctly', function () {
                            assert.strictEqual(log.args.callback[0][0], 'foo');
                            assert.isArray(log.args.callback[0][1]);
                            assert.lengthOf(log.args.callback[0][1], 0);
                        });
                    });

                    suite('error event:', function () {
                        setup(function () {
                            log.args.on[9][1]('bar');
                        });

                        test('callback was not called', function () {
                            assert.strictEqual(log.counts.callback, 0);
                        });

                        suite('end event:', function () {
                            setup(function () {
                                log.args.on[8][1]();
                            });

                            test('callback was called once', function () {
                                assert.strictEqual(log.counts.callback, 1);
                            });

                            test('callback was called correctly', function () {
                                assert.strictEqual(log.args.callback[0][0], 'foo');
                                assert.isArray(log.args.callback[0][1]);
                                assert.lengthOf(log.args.callback[0][1], 0);
                            });
                        });
                    });
                });
            });

            suite('object event:', function () {
                setup(function () {
                    log.args.on[1][1]();
                });

                test('callback was not called', function () {
                    assert.strictEqual(log.counts.callback, 0);
                });

                suite('end event:', function () {
                    setup(function () {
                        log.args.on[8][1]();
                    });

                    test('callback was called once', function () {
                        assert.strictEqual(log.counts.callback, 1);
                    });

                    test('callback was called correctly', function () {
                        assert.isObject(log.args.callback[0][1]);
                        assert.lengthOf(Object.keys(log.args.callback[0][1]), 0);
                    });
                });
            });
        });*/
    });

    function nop () {};
});

