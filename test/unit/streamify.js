'use strict';

var assert, mockery, spooks, modulePath;

assert = require('chai').assert;
mockery = require('mockery');
spooks = require('spooks');

modulePath = '../../src/streamify';

mockery.registerAllowable(modulePath);
mockery.registerAllowable('./events');
mockery.registerAllowable('./time');

suite('streamify:', function () {
    var log, results;

    setup(function () {
        log = {};
        results = {
            eventify: [
                { on: spooks.fn({ name: 'on', log: log }) }
            ],
            push: [ true ]
        };

        mockery.enable({ useCleanCache: true });
        mockery.registerMock('./eventify', spooks.fn({
            name: 'eventify',
            log: log,
            results: results.eventify
        }));
        mockery.registerMock('./jsonstream', spooks.ctor({
            name: 'JsonStream',
            log: log,
            archetype: { instance: { push: function () {}, emit: function () {} } },
            results: results
        }));
    });

    teardown(function () {
        mockery.deregisterMock('./jsonstream');
        mockery.deregisterMock('./eventify');
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
        var streamify;

        setup(function () {
            streamify = require(modulePath);
        });

        teardown(function () {
            streamify = undefined;
        });

        test('streamify expects two arguments', function () {
            assert.lengthOf(streamify, 2);
        });

        test('streamify does not throw', function () {
            assert.doesNotThrow(function () {
                streamify();
            });
        });

        test('streamify returns stream', function () {
            assert.strictEqual(streamify(), require('./jsonstream')());
        });

        test('JsonStream was not called', function () {
            assert.strictEqual(log.counts.JsonStream, 0);
        });

        test('eventify was not called', function () {
            assert.strictEqual(log.counts.eventify, 0);
        });

        test('EventEmitter.on was not called', function () {
            assert.strictEqual(log.counts.on, 0);
        });

        suite('streamify:', function () {
            var data, options, result;

            setup(function () {
                data = {};
                options = {};
                result = streamify(data, options);
            });

            teardown(function () {
                data = options = result = undefined;
            });

            test('JsonStream was called once', function () {
                assert.strictEqual(log.counts.JsonStream, 1);
                assert.isObject(log.these.JsonStream[0]);
            });

            test('JsonStream was called correctly', function () {
                assert.lengthOf(log.args.JsonStream[0], 1);
                assert.isFunction(log.args.JsonStream[0][0]);
            });

            test('eventify was called once', function () {
                assert.strictEqual(log.counts.eventify, 1);
                assert.isUndefined(log.these.eventify[0]);
            });

            test('eventify was called correctly', function () {
                assert.lengthOf(log.args.eventify[0], 2);
                assert.strictEqual(log.args.eventify[0][0], data);
                assert.lengthOf(Object.keys(log.args.eventify[0][0]), 0);
                assert.strictEqual(log.args.eventify[0][1], options);
                assert.lengthOf(Object.keys(log.args.eventify[0][1]), 0);
            });

            test('EventEmitter.on was called ten times', function () {
                assert.strictEqual(log.counts.on, 10);
                assert.strictEqual(log.these.on[0], results.eventify[0]);
                assert.strictEqual(log.these.on[1], results.eventify[0]);
                assert.strictEqual(log.these.on[2], results.eventify[0]);
                assert.strictEqual(log.these.on[3], results.eventify[0]);
                assert.strictEqual(log.these.on[4], results.eventify[0]);
                assert.strictEqual(log.these.on[5], results.eventify[0]);
                assert.strictEqual(log.these.on[6], results.eventify[0]);
                assert.strictEqual(log.these.on[7], results.eventify[0]);
                assert.strictEqual(log.these.on[8], results.eventify[0]);
                assert.strictEqual(log.these.on[9], results.eventify[0]);
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
                assert.notStrictEqual(log.args.on[4][1], log.args.on[0][1]);
                assert.notStrictEqual(log.args.on[4][1], log.args.on[1][1]);
                assert.notStrictEqual(log.args.on[4][1], log.args.on[2][1]);
                assert.notStrictEqual(log.args.on[4][1], log.args.on[3][1]);
            });

            test('EventEmitter.on was called correctly sixth time', function () {
                assert.lengthOf(log.args.on[5], 2);
                assert.strictEqual(log.args.on[5][0], 'lit');
                assert.isFunction(log.args.on[5][1]);
                assert.strictEqual(log.args.on[5][1], log.args.on[4][1]);
            });

            test('EventEmitter.on was called correctly seventh time', function () {
                assert.lengthOf(log.args.on[6], 2);
                assert.strictEqual(log.args.on[6][0], 'end-arr');
                assert.isFunction(log.args.on[6][1]);
                assert.notStrictEqual(log.args.on[6][1], log.args.on[0][1]);
                assert.notStrictEqual(log.args.on[6][1], log.args.on[1][1]);
                assert.notStrictEqual(log.args.on[6][1], log.args.on[2][1]);
                assert.notStrictEqual(log.args.on[6][1], log.args.on[3][1]);
                assert.notStrictEqual(log.args.on[6][1], log.args.on[4][1]);
            });

            test('EventEmitter.on was called correctly eighth time', function () {
                assert.lengthOf(log.args.on[7], 2);
                assert.strictEqual(log.args.on[7][0], 'end-obj');
                assert.isFunction(log.args.on[7][1]);
                assert.notStrictEqual(log.args.on[7][1], log.args.on[0][1]);
                assert.notStrictEqual(log.args.on[7][1], log.args.on[1][1]);
                assert.notStrictEqual(log.args.on[7][1], log.args.on[2][1]);
                assert.notStrictEqual(log.args.on[7][1], log.args.on[3][1]);
                assert.notStrictEqual(log.args.on[7][1], log.args.on[4][1]);
                assert.notStrictEqual(log.args.on[7][1], log.args.on[6][1]);
            });

            test('EventEmitter.on was called correctly ninth time', function () {
                assert.lengthOf(log.args.on[8], 2);
                assert.strictEqual(log.args.on[8][0], 'end');
                assert.isFunction(log.args.on[8][1]);
                assert.notStrictEqual(log.args.on[8][1], log.args.on[0][1]);
                assert.notStrictEqual(log.args.on[8][1], log.args.on[1][1]);
                assert.notStrictEqual(log.args.on[8][1], log.args.on[2][1]);
                assert.notStrictEqual(log.args.on[8][1], log.args.on[3][1]);
                assert.notStrictEqual(log.args.on[8][1], log.args.on[4][1]);
                assert.notStrictEqual(log.args.on[8][1], log.args.on[6][1]);
                assert.notStrictEqual(log.args.on[8][1], log.args.on[7][1]);
            });

            test('EventEmitter.on was called correctly tenth time', function () {
                assert.lengthOf(log.args.on[9], 2);
                assert.strictEqual(log.args.on[9][0], 'err');
                assert.isFunction(log.args.on[9][1]);
                assert.notStrictEqual(log.args.on[9][1], log.args.on[0][1]);
                assert.notStrictEqual(log.args.on[9][1], log.args.on[1][1]);
                assert.notStrictEqual(log.args.on[9][1], log.args.on[2][1]);
                assert.notStrictEqual(log.args.on[9][1], log.args.on[3][1]);
                assert.notStrictEqual(log.args.on[9][1], log.args.on[4][1]);
                assert.notStrictEqual(log.args.on[9][1], log.args.on[6][1]);
                assert.notStrictEqual(log.args.on[9][1], log.args.on[7][1]);
                assert.notStrictEqual(log.args.on[9][1], log.args.on[8][1]);
            });

            suite('array event:', function () {
                setup(function () {
                    log.args.on[0][1]();
                });

                test('stream.push was not called', function () {
                    assert.strictEqual(log.counts.push, 0);
                });

                suite('end event:', function () {
                    setup(function () {
                        log.args.on[8][1]();
                    });

                    test('stream.push was not called', function () {
                        assert.strictEqual(log.counts.push, 0);
                    });

                    suite('read stream:', function () {
                        setup(function () {
                            log.args.JsonStream[0][0]();
                        });

                        test('stream.push was called twice', function () {
                            assert.strictEqual(log.counts.push, 2);
                            assert.strictEqual(log.these.push[0], require('./jsonstream')());
                            assert.strictEqual(log.these.push[1], require('./jsonstream')());
                        });

                        test('stream.push was called correctly first time', function () {
                            assert.lengthOf(log.args.push[0], 2);
                            assert.strictEqual(log.args.push[0][0], '[');
                            assert.strictEqual(log.args.push[0][1], 'utf8');
                        });

                        test('stream.push was called correctly second time', function () {
                            assert.lengthOf(log.args.push[1], 1);
                            assert.isNull(log.args.push[1][0]);
                        });

                        test('stream.emit was not called', function () {
                            assert.strictEqual(log.counts.emit, 0);
                        });
                    });
                });

                suite('read stream:', function () {
                    setup(function () {
                        log.args.JsonStream[0][0]();
                    });

                    test('stream.push was not called', function () {
                        assert.strictEqual(log.counts.push, 0);
                    });

                    suite('end event:', function () {
                        setup(function () {
                            log.args.on[8][1]();
                        });

                        test('stream.push was called twice', function () {
                            assert.strictEqual(log.counts.push, 2);
                        });

                        test('stream.push was called correctly first time', function () {
                            assert.strictEqual(log.args.push[0][0], '[');
                        });

                        test('stream.push was called correctly second time', function () {
                            assert.isNull(log.args.push[1][0]);
                        });

                        test('stream.emit was not called', function () {
                            assert.strictEqual(log.counts.emit, 0);
                        });
                    });

                    suite('string event:', function () {
                        setup(function () {
                            log.args.on[3][1]('foo');
                        });

                        test('stream.push was called once', function () {
                            assert.strictEqual(log.counts.push, 1);
                        });

                        test('stream.push was called correctly', function () {
                            assert.strictEqual(log.args.push[0][0], '["foo"');
                        });

                        suite('string event:', function () {
                            setup(function () {
                                log.args.on[3][1]('bar');
                            });

                            test('stream.push was called once', function () {
                                assert.strictEqual(log.counts.push, 2);
                            });

                            test('stream.push was called correctly', function () {
                                assert.strictEqual(log.args.push[1][0], ',"bar"');
                            });
                        });

                        suite('array event:', function () {
                            setup(function () {
                                log.args.on[0][1]();
                            });

                            test('stream.push was called once', function () {
                                assert.strictEqual(log.counts.push, 2);
                            });

                            test('stream.push was called correctly', function () {
                                assert.strictEqual(log.args.push[1][0], ',[');
                            });

                            suite('array event:', function () {
                                setup(function () {
                                    log.args.on[0][1]();
                                });

                                test('stream.push was called once', function () {
                                    assert.strictEqual(log.counts.push, 3);
                                });

                                test('stream.push was called correctly', function () {
                                    assert.strictEqual(log.args.push[2][0], '[');
                                });

                                suite('endArray event:', function () {
                                    setup(function () {
                                        log.args.on[6][1]();
                                    });

                                    test('stream.push was called once', function () {
                                        assert.strictEqual(log.counts.push, 4);
                                    });

                                    test('stream.push was called correctly', function () {
                                        assert.strictEqual(log.args.push[3][0], ']');
                                    });

                                    suite('string event:', function () {
                                        setup(function () {
                                            log.args.on[3][1]('bar');
                                        });

                                        test('stream.push was called once', function () {
                                            assert.strictEqual(log.counts.push, 5);
                                        });

                                        test('stream.push was called correctly', function () {
                                            assert.strictEqual(log.args.push[4][0], ',"bar"');
                                        });

                                        suite('string event:', function () {
                                            setup(function () {
                                                log.args.on[3][1]('baz');
                                            });

                                            test('stream.push was called once', function () {
                                                assert.strictEqual(log.counts.push, 6);
                                            });

                                            test('stream.push was called correctly', function () {
                                                assert.strictEqual(log.args.push[5][0], ',"baz"');
                                            });
                                        });

                                        suite('endArray event:', function () {
                                            setup(function () {
                                                log.args.on[6][1]();
                                            });

                                            test('stream.push was called once', function () {
                                                assert.strictEqual(log.counts.push, 6);
                                            });

                                            test('stream.push was called correctly', function () {
                                                assert.strictEqual(log.args.push[5][0], ']');
                                            });

                                            suite('string event:', function () {
                                                setup(function () {
                                                    log.args.on[3][1]('baz');
                                                });

                                                test('stream.push was called once', function () {
                                                    assert.strictEqual(log.counts.push, 7);
                                                });

                                                test('stream.push was called correctly', function () {
                                                    assert.strictEqual(log.args.push[6][0], ',"baz"');
                                                });

                                                test('stream.emit was not called', function () {
                                                    assert.strictEqual(log.counts.emit, 0);
                                                });
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

                            test('stream.push was called once', function () {
                                assert.strictEqual(log.counts.push, 2);
                            });

                            test('stream.push was called correctly', function () {
                                assert.strictEqual(log.args.push[1][0], ',{');
                            });

                            suite('property event:', function () {
                                setup(function () {
                                    log.args.on[2][1]('bar');
                                });

                                test('stream.push was called once', function () {
                                    assert.strictEqual(log.counts.push, 3);
                                });

                                test('stream.push was called correctly', function () {
                                    assert.strictEqual(log.args.push[2][0], '"bar":');
                                });

                                suite('string event:', function () {
                                    setup(function () {
                                        log.args.on[3][1]('baz');
                                    });

                                    test('stream.push was called once', function () {
                                        assert.strictEqual(log.counts.push, 4);
                                    });

                                    test('stream.push was called correctly', function () {
                                        assert.strictEqual(log.args.push[3][0], '"baz"');
                                    });

                                    suite('property event:', function () {
                                        setup(function () {
                                            log.args.on[2][1]('nested');
                                        });

                                        test('stream.push was called once', function () {
                                            assert.strictEqual(log.counts.push, 5);
                                        });

                                        test('stream.push was called correctly', function () {
                                            assert.strictEqual(log.args.push[4][0], ',"nested":');
                                        });

                                        suite('object event:', function () {
                                            setup(function () {
                                                log.args.on[1][1]();
                                            });

                                            test('stream.push was called once', function () {
                                                assert.strictEqual(log.counts.push, 6);
                                            });

                                            test('stream.push was called correctly', function () {
                                                assert.strictEqual(log.args.push[5][0], '{');
                                            });

                                            suite('endObject event:', function () {
                                                setup(function () {
                                                    log.args.on[7][1]();
                                                });

                                                test('stream.push was called once', function () {
                                                    assert.strictEqual(log.counts.push, 7);
                                                });

                                                test('stream.push was called correctly', function () {
                                                    assert.strictEqual(log.args.push[6][0], '}');
                                                });

                                                suite('property event:', function () {
                                                    setup(function () {
                                                        log.args.on[2][1]('qux');
                                                    });

                                                    test('stream.push was called once', function () {
                                                        assert.strictEqual(log.counts.push, 8);
                                                    });

                                                    test('stream.push was called correctly', function () {
                                                        assert.strictEqual(log.args.push[7][0], ',"qux":');
                                                    });

                                                    suite('string event:', function () {
                                                        setup(function () {
                                                            log.args.on[3][1]('wibble');
                                                        });

                                                        test('stream.push was called once', function () {
                                                            assert.strictEqual(log.counts.push, 9);
                                                        });

                                                        test('stream.push was called correctly', function () {
                                                            assert.strictEqual(log.args.push[8][0], '"wibble"');
                                                        });
                                                    });
                                                });

                                                suite('endObject event:', function () {
                                                    setup(function () {
                                                        log.args.on[7][1]();
                                                    });

                                                    test('stream.push was called once', function () {
                                                        assert.strictEqual(log.counts.push, 8);
                                                    });

                                                    test('stream.push was called correctly', function () {
                                                        assert.strictEqual(log.args.push[7][0], '}');
                                                    });

                                                    suite('string event:', function () {
                                                        setup(function () {
                                                            log.args.on[3][1]('wibble');
                                                        });

                                                        test('stream.push was called once', function () {
                                                            assert.strictEqual(log.counts.push, 9);
                                                        });

                                                        test('stream.push was called correctly', function () {
                                                            assert.strictEqual(log.args.push[8][0], ',"wibble"');
                                                        });

                                                        test('stream.emit was not called', function () {
                                                            assert.strictEqual(log.counts.emit, 0);
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });

                    suite('string event, push returns false:', function () {
                        setup(function () {
                            results.push[0] = false;
                            log.args.on[3][1]('foo');
                        });

                        teardown(function () {
                            results.push[0] = true;
                        });

                        test('stream.push was called once', function () {
                            assert.strictEqual(log.counts.push, 1);
                        });

                        test('stream.push was called correctly', function () {
                            assert.strictEqual(log.args.push[0][0], '["foo"');
                        });

                        suite('string event:', function () {
                            setup(function () {
                                log.args.on[3][1]('bar');
                            });

                            test('stream.push was not called', function () {
                                assert.strictEqual(log.counts.push, 1);
                            });

                            suite('read stream, endArrayEvent:', function () {
                                setup(function () {
                                    log.args.JsonStream[0][0]();
                                    log.args.on[6][1]();
                                });

                                test('stream.push was called once', function () {
                                    assert.strictEqual(log.counts.push, 2);
                                });

                                test('stream.push was called correctly', function () {
                                    assert.strictEqual(log.args.push[1][0], ',"bar"]');
                                });

                                test('stream.emit was not called', function () {
                                    assert.strictEqual(log.counts.emit, 0);
                                });
                            });

                            suite('end event:', function () {
                                setup(function () {
                                    log.args.on[8][1]();
                                });

                                test('stream.push was not called', function () {
                                    assert.strictEqual(log.counts.push, 1);
                                });

                                suite('read stream:', function () {
                                    setup(function () {
                                        log.args.JsonStream[0][0]();
                                    });

                                    test('stream.push was called once', function () {
                                        assert.strictEqual(log.counts.push, 2);
                                    });

                                    test('stream.push was called correctly', function () {
                                        assert.strictEqual(log.args.push[1][0], ',"bar"');
                                    });

                                    suite('read stream:', function () {
                                        setup(function () {
                                            log.args.JsonStream[0][0]();
                                        });

                                        test('stream.push was called once', function () {
                                            assert.strictEqual(log.counts.push, 3);
                                        });

                                        test('stream.push was called correctly', function () {
                                            assert.isNull(log.args.push[2][0]);
                                        });

                                        test('stream.emit was not called', function () {
                                            assert.strictEqual(log.counts.emit, 0);
                                        });
                                    })
                                });

                                suite('read stream, push returns true:', function () {
                                    setup(function () {
                                        results.push[0] = true;
                                        log.args.JsonStream[0][0]();
                                    });

                                    test('stream.push was called twice', function () {
                                        assert.strictEqual(log.counts.push, 3);
                                    });

                                    test('stream.push was called correctly first time', function () {
                                        assert.strictEqual(log.args.push[1][0], ',"bar"');
                                    });

                                    test('stream.push was called correctly second time', function () {
                                        assert.isNull(log.args.push[2][0]);
                                    });

                                    test('stream.emit was not called', function () {
                                        assert.strictEqual(log.counts.emit, 0);
                                    });
                                });
                            });
                        });
                    });
                });

                suite('object event:', function () {
                    setup(function () {
                        log.args.JsonStream[0][0]();
                        log.args.on[1][1]();
                    });

                    test('stream.push was called once', function () {
                        assert.strictEqual(log.counts.push, 1);
                    });

                    test('stream.push was called correctly', function () {
                        assert.strictEqual(log.args.push[0][0], '[{');
                    });

                    test('stream.emit was not called', function () {
                        assert.strictEqual(log.counts.emit, 0);
                    });
                });
            });
        });

        suite('streamify with space option:', function () {
            var data, options, result;

            setup(function () {
                data = {};
                options = { space: 2 };
                result = streamify(data, options);
            });

            teardown(function () {
                data = options = result = undefined;
            });

            test('JsonStream was called once', function () {
                assert.strictEqual(log.counts.JsonStream, 1);
            });

            test('eventify was called once', function () {
                assert.strictEqual(log.counts.eventify, 1);
            });

            test('EventEmitter.on was called ten times', function () {
                assert.strictEqual(log.counts.on, 10);
            });

            test('stream.push was not called', function () {
                assert.strictEqual(log.counts.push, 0);
            });

            suite('read stream, object event:', function () {
                setup(function () {
                    log.args.JsonStream[0][0]();
                    log.args.on[1][1]();
                });

                test('stream.push was called once', function () {
                    assert.strictEqual(log.counts.push, 1);
                });

                test('stream.push was called correctly', function () {
                    assert.strictEqual(log.args.push[0][0], '{');
                });

                suite('property event:', function () {
                    setup(function () {
                        log.args.on[2][1]('foo');
                    });

                    test('stream.push was called once', function () {
                        assert.strictEqual(log.counts.push, 2);
                    });

                    test('stream.push was called correctly', function () {
                        assert.strictEqual(log.args.push[1][0], '\n  "foo":');
                    });

                    suite('string event:', function () {
                        setup(function () {
                            log.args.on[3][1]('bar');
                        });

                        test('stream.push was called once', function () {
                            assert.strictEqual(log.counts.push, 3);
                        });

                        test('stream.push was called correctly', function () {
                            assert.strictEqual(log.args.push[2][0], ' "bar"');
                        });

                        suite('property event:', function () {
                            setup(function () {
                                log.args.on[2][1]('baz');
                            });

                            test('stream.push was called once', function () {
                                assert.strictEqual(log.counts.push, 4);
                            });

                            test('stream.push was called correctly', function () {
                                assert.strictEqual(log.args.push[3][0], ',\n  "baz":');
                            });

                            suite('string event:', function () {
                                setup(function () {
                                    log.args.on[3][1]('qux');
                                });

                                test('stream.push was called once', function () {
                                    assert.strictEqual(log.counts.push, 5);
                                });

                                test('stream.push was called correctly', function () {
                                    assert.strictEqual(log.args.push[4][0], ' "qux"');
                                });

                                suite('property event:', function () {
                                    setup(function () {
                                        log.args.on[2][1]('wibble');
                                    });

                                    test('stream.push was called once', function () {
                                        assert.strictEqual(log.counts.push, 6);
                                    });

                                    test('stream.push was called correctly', function () {
                                        assert.strictEqual(log.args.push[5][0], ',\n  "wibble":');
                                    });

                                    suite('array event:', function () {
                                        setup(function () {
                                            log.args.on[0][1]();
                                        });

                                        test('stream.push was called once', function () {
                                            assert.strictEqual(log.counts.push, 7);
                                        });

                                        test('stream.push was called correctly', function () {
                                            assert.strictEqual(log.args.push[6][0], ' [');
                                        });

                                        suite('string event:', function () {
                                            setup(function () {
                                                log.args.on[3][1]('0');
                                            });

                                            test('stream.push was called once', function () {
                                                assert.strictEqual(log.counts.push, 8);
                                            });

                                            test('stream.push was called correctly', function () {
                                                assert.strictEqual(log.args.push[7][0], '\n    "0"');
                                            });

                                            suite('string event:', function () {
                                                setup(function () {
                                                    log.args.on[3][1]('1');
                                                });

                                                test('stream.push was called once', function () {
                                                    assert.strictEqual(log.counts.push, 9);
                                                });

                                                test('stream.push was called correctly', function () {
                                                    assert.strictEqual(log.args.push[8][0], ',\n    "1"');
                                                });

                                                suite('endArray event:', function () {
                                                    setup(function () {
                                                        log.args.on[6][1]();
                                                    });

                                                    test('stream.push was called once', function () {
                                                        assert.strictEqual(log.counts.push, 10);
                                                    });

                                                    test('stream.push was called correctly', function () {
                                                        assert.strictEqual(log.args.push[9][0], '\n  ]');
                                                    });

                                                    suite('property event:', function () {
                                                        setup(function () {
                                                            log.args.on[2][1]('a');
                                                        });

                                                        test('stream.push was called once', function () {
                                                            assert.strictEqual(log.counts.push, 11);
                                                        });

                                                        test('stream.push was called correctly', function () {
                                                            assert.strictEqual(log.args.push[10][0], ',\n  "a":');
                                                        });

                                                        suite('string event:', function () {
                                                            setup(function () {
                                                                log.args.on[3][1]('b');
                                                            });

                                                            test('stream.push was called once', function () {
                                                                assert.strictEqual(log.counts.push, 12);
                                                            });

                                                            test('stream.push was called correctly', function () {
                                                                assert.strictEqual(log.args.push[11][0], ' "b"');
                                                            });

                                                            suite('endObject event:', function () {
                                                                setup(function () {
                                                                    log.args.on[7][1]();
                                                                });

                                                                test('stream.push was called once', function () {
                                                                    assert.strictEqual(log.counts.push, 13);
                                                                });

                                                                test('stream.push was called correctly', function () {
                                                                    assert.strictEqual(log.args.push[12][0], '\n}');
                                                                });

                                                                test('stream.emit was not called', function () {
                                                                    assert.strictEqual(log.counts.emit, 0);
                                                                });
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });

            suite('read stream, end event:', function () {
                setup(function () {
                    log.args.JsonStream[0][0]();
                    log.args.on[8][1]();
                });

                test('stream.push was called twice', function () {
                    assert.strictEqual(log.counts.push, 2);
                });

                test('stream.push was called correctly first time', function () {
                    assert.strictEqual(log.args.push[0][0], '');
                });

                test('stream.push was called correctly second time', function () {
                    assert.isNull(log.args.push[1][0]);
                });

                test('stream.emit was not called', function () {
                    assert.strictEqual(log.counts.emit, 0);
                });
            });

            suite('error event:', function () {
                setup(function () {
                    log.args.on[9][1]('foo');
                });

                test('stream.emit was called once', function () {
                    assert.strictEqual(log.counts.emit, 1);
                });

                test('stream.emit was called correctly', function () {
                    assert.lengthOf(log.args.emit[0], 2);
                    assert.strictEqual(log.args.emit[0][0], 'dataError');
                    assert.strictEqual(log.args.emit[0][1], 'foo');
                });
            });
        });
    });
});

