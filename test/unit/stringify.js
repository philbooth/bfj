'use strict';

var assert, mockery, spooks, modulePath;

assert = require('chai').assert;
mockery = require('mockery');
spooks = require('spooks');

modulePath = '../../src/stringify';

mockery.registerAllowable(modulePath);

suite('stringify:', function () {
    var log;

    setup(function () {
        log = {};

        mockery.enable({ useCleanCache: true });
        mockery.registerMock('./streamify', spooks.fn({
            name: 'streamify',
            log: log,
            results: [
                {
                    on: spooks.fn({ name: 'on', log: log })
                }
            ]
        }));
    });

    teardown(function () {
        mockery.deregisterMock('./streamify');
        mockery.disable();

        log = undefined;
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
        var stringify;

        setup(function () {
            stringify = require(modulePath);
        });

        teardown(function () {
            stringify = undefined;
        });

        test('stringify expects two arguments', function () {
            assert.lengthOf(stringify, 2);
        });

        test('stringify does not throw', function () {
            assert.doesNotThrow(function () {
                stringify();
            });
        });

        test('stringify returns promise', function () {
            assert.instanceOf(stringify(), Promise);
        });

        test('streamify was not called', function () {
            assert.strictEqual(log.counts.streamify, 0);
        });

        suite('stringify:', function () {
            var data, options, resolved, rejected, result, done;

            setup(function () {
                data = {};
                options = {};
                result = stringify(data, options);
                result.then(function (r) { resolved = r; done(); });
                result.catch(function (r) { rejected = r; done(); });
            });

            teardown(function () {
                data = options = resolved = rejected = result = done = undefined;
            });

            test('streamify was called once', function () {
                assert.strictEqual(log.counts.streamify, 1);
                assert.isUndefined(log.these.streamify[0]);
            });

            test('streamify was called correctly', function () {
                assert.lengthOf(log.args.streamify[0], 2);
                assert.strictEqual(log.args.streamify[0][0], data);
                assert.lengthOf(Object.keys(log.args.streamify[0][0]), 0);
                assert.strictEqual(log.args.streamify[0][1], options);
                assert.lengthOf(Object.keys(log.args.streamify[0][1]), 0);
            });

            test('stream.on was called three times', function () {
                assert.strictEqual(log.counts.on, 3);
                assert.strictEqual(log.these.on[0], require('./streamify')());
                assert.strictEqual(log.these.on[1], require('./streamify')());
                assert.strictEqual(log.these.on[2], require('./streamify')());
            });

            test('stream.on was called correctly first time', function () {
                assert.lengthOf(log.args.on[0], 2);
                assert.strictEqual(log.args.on[0][0], 'data');
                assert.isFunction(log.args.on[0][1]);
            });

            test('stream.on was called correctly second time', function () {
                assert.strictEqual(log.args.on[1][0], 'end');
                assert.isFunction(log.args.on[1][1]);
                assert.notStrictEqual(log.args.on[1][1], log.args.on[0][1]);
            });

            test('stream.on was called correctly third time', function () {
                assert.strictEqual(log.args.on[2][0], 'dataError');
                assert.isFunction(log.args.on[2][1]);
                assert.notStrictEqual(log.args.on[2][1], log.args.on[0][1]);
                assert.notStrictEqual(log.args.on[2][1], log.args.on[1][1]);
            });

            test('promise is unfulfilled', function () {
                assert.isUndefined(resolved);
                assert.isUndefined(rejected);
            });

            suite('data event:', function () {
                setup(function () {
                    log.args.on[0][1]('foo');
                });

                test('promise is unfulfilled', function () {
                    assert.isUndefined(resolved);
                    assert.isUndefined(rejected);
                });

                suite('end event:', function () {
                    setup(function (d) {
                        done = d;
                        log.args.on[1][1]();
                    });

                    test('promise is resolved', function () {
                        assert.strictEqual(resolved, 'foo');
                    });

                    test('promise is not rejected', function () {
                        assert.isUndefined(rejected);
                    });
                });

                suite('data event:', function () {
                    setup(function () {
                        log.args.on[0][1]('bar');
                    });

                    test('promise is unfulfilled', function () {
                        assert.isUndefined(resolved);
                        assert.isUndefined(rejected);
                    });

                    suite('end event:', function () {
                        setup(function (d) {
                            done = d;
                            log.args.on[1][1]();
                        });

                        test('promise is resolved', function () {
                            assert.strictEqual(resolved, 'foobar');
                        });
                    });

                    suite('dataError event:', function () {
                        setup(function (d) {
                            done = d;
                            log.args.on[2][1]('wibble');
                        });

                        test('promise is rejected', function () {
                            assert.strictEqual(rejected, 'wibble');
                        });
                    });
                });
            });
        });
    });
});

