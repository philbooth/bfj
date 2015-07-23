'use strict';

var assert, mockery, spooks, modulePath;

assert = require('chai').assert;
mockery = require('mockery');
spooks = require('spooks');

modulePath = '../../src/write';

mockery.registerAllowable(modulePath);

suite('write:', function () {
    var log, results;

    setup(function () {
        log = {};
        results = {
            createWriteStream: [ {} ]
        };

        mockery.enable({ useCleanCache: true });
        mockery.registerMock('fs', {
            createWriteStream: spooks.fn({
                name: 'createWriteStream',
                log: log,
                results: results.createWriteStream
            })
        });
        mockery.registerMock('./streamify', spooks.fn({
            name: 'streamify',
            log: log,
            results: [
                {
                    pipe: spooks.fn({ name: 'pipe', log: log, chain: true }),
                    on: spooks.fn({ name: 'on', log: log, chain: true })
                }
            ]
        }));
    });

    teardown(function () {
        mockery.deregisterMock('./streamify');
        mockery.deregisterMock('fs');
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
        var write;

        setup(function () {
            write = require(modulePath);
        });

        teardown(function () {
            write = undefined;
        });

        test('write expects three arguments', function () {
            assert.lengthOf(write, 3);
        });

        test('write does not throw', function () {
            assert.doesNotThrow(function () {
                write();
            });
        });

        test('streamify was not called', function () {
            assert.strictEqual(log.counts.streamify, 0);
        });

        test('fs.createWriteStream was not called', function () {
            assert.strictEqual(log.counts.createWriteStream, 0);
        });

        test('stream.pipe was not called', function () {
            assert.strictEqual(log.counts.pipe, 0);
        });

        test('stream.on was not called', function () {
            assert.strictEqual(log.counts.on, 0);
        });

        suite('write:', function () {
            var path, data, options, result;

            setup(function () {
                path = {};
                data = {};
                options = {};
                result = write(path, data, options);
            });

            teardown(function () {
                path = data = options = result = undefined;
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

            test('fs.createWriteStream was called once', function () {
                assert.strictEqual(log.counts.createWriteStream, 1);
                assert.strictEqual(log.these.createWriteStream[0], require('fs'));
            });

            test('fs.createWriteStream was called correctly', function () {
                assert.lengthOf(log.args.createWriteStream[0], 2);
                assert.strictEqual(log.args.createWriteStream[0][0], path);
                assert.lengthOf(Object.keys(log.args.createWriteStream[0][0]), 0);
                assert.strictEqual(log.args.createWriteStream[0][1], options);
                assert.lengthOf(Object.keys(log.args.createWriteStream[0][1]), 0);
            });

            test('stream.pipe was called once', function () {
                assert.strictEqual(log.counts.pipe, 1);
                assert.strictEqual(log.these.pipe[0], require('./streamify')());
            });

            test('stream.pipe was called correctly', function () {
                assert.lengthOf(log.args.pipe[0], 1);
                assert.strictEqual(log.args.pipe[0][0], results.createWriteStream[0]);
                assert.lengthOf(Object.keys(log.args.pipe[0][0]), 0);
            });

            test('stream.on was called three times', function () {
                assert.strictEqual(log.counts.on, 3);
                assert.strictEqual(log.these.on[0], require('./streamify')());
                assert.strictEqual(log.these.on[1], require('./streamify')());
                assert.strictEqual(log.these.on[2], require('./streamify')());
            });

            test('stream.on was called correctly first time', function () {
                assert.lengthOf(log.args.on[0], 2);
                assert.strictEqual(log.args.on[0][0], 'finish');
                assert.isFunction(log.args.on[0][1]);
            });

            test('stream.on was called correctly second time', function () {
                assert.lengthOf(log.args.on[1], 2);
                assert.strictEqual(log.args.on[1][0], 'error');
                assert.isFunction(log.args.on[1][1]);
                assert.notStrictEqual(log.args.on[1][1], log.args.on[0][1]);
            });

            test('stream.on was called correctly third time', function () {
                assert.lengthOf(log.args.on[2], 2);
                assert.strictEqual(log.args.on[2][0], 'dataError');
                assert.isFunction(log.args.on[2][1]);
                assert.notStrictEqual(log.args.on[2][1], log.args.on[0][1]);
                assert.strictEqual(log.args.on[2][1], log.args.on[1][1]);
            });

            test('promise was returned', function () {
                assert.instanceOf(result, Promise);
            });

            suite('dispatch finish event:', function () {
                var resolved, error, passed, failed;

                setup(function (done) {
                    passed = failed = false;

                    result.then(function (r) {
                        resolved = r;
                        passed = true;
                        done();
                    }).catch(function (e) {
                        error = e;
                        failed = true;
                        done();
                    });
                    log.args.on[0][1]('foo');
                });

                teardown(function () {
                    resolved = error = passed = failed = undefined;
                });

                test('promise was resolved', function () {
                    assert.isTrue(passed);
                    assert.isFalse(failed);
                    assert.isUndefined(resolved);
                });
            });

            suite('dispatch error event:', function () {
                var resolved, error, passed, failed;

                setup(function (done) {
                    passed = failed = false;

                    result.then(function (r) {
                        resolved = r;
                        passed = true;
                        done();
                    }).catch(function (e) {
                        error = e;
                        failed = true;
                        done();
                    });
                    log.args.on[1][1]('foo');
                });

                teardown(function () {
                    resolved = error = passed = failed = undefined;
                });

                test('promise was rejected', function () {
                    assert.isTrue(failed);
                    assert.isFalse(passed);
                    assert.strictEqual(error, 'foo');
                });
            });

            suite('dispatch dataError event:', function () {
                var resolved, error, passed, failed;

                setup(function (done) {
                    passed = failed = false;

                    result.then(function (r) {
                        resolved = r;
                        passed = true;
                        done();
                    }).catch(function (e) {
                        error = e;
                        failed = true;
                        done();
                    });
                    log.args.on[2][1]('wibble');
                });

                teardown(function () {
                    resolved = error = passed = failed = undefined;
                });

                test('promise was rejected', function () {
                    assert.isTrue(failed);
                    assert.isFalse(passed);
                    assert.strictEqual(error, 'wibble');
                });
            });
        });
    });
});

