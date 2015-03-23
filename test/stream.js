'use strict';

var assert, spooks, modulePath;

assert = require('chai').assert;
spooks = require('spooks');

modulePath = '../src/stream';

suite('stream:', function () {
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

    test('require returns function', function () {
        assert.isFunction(require(modulePath));
    });

    suite('require:', function () {
        var Stream;

        setup(function () {
            Stream = require(modulePath);
        });

        teardown(function () {
            Stream = undefined;
        });

        test('Stream expects one argument', function () {
            assert.lengthOf(Stream, 1);
        });

        test('calling Stream with function argument doesNotThrow', function () {
            assert.doesNotThrow(function () {
                Stream(function () {});
            });
        });

        test('calling Stream with object argument throws', function () {
            assert.throws(function () {
                Stream({ write: function () {} });
            });
        });

        test('calling Stream with new returns Stream instance', function () {
            assert.instanceOf(new Stream(function () {}), Stream);
        });

        test('calling Stream with new returns Writable instance', function () {
            assert.instanceOf(new Stream(function () {}), require('stream').Writable);
        });

        test('calling Stream without new returns Stream instance', function () {
            assert.instanceOf(Stream(function () {}), Stream);
        });

        suite('instantiate:', function () {
            var stream;

            setup(function () {
                stream = new Stream(spooks.fn({ name: 'write', log: log }));
            });

            teardown(function () {
                stream = undefined;
            });

            test('stream has _write method', function () {
                assert.isFunction(stream._write);
            });

            test('_write expects three arguments', function () {
                assert.lengthOf(stream._write, 3);
            });

            test('write was not called', function () {
                assert.strictEqual(log.counts.write, 0);
            });

            suite('stream._write:', function () {
                setup(function () {
                    stream._write({
                        toString: function () {
                            return 'foo bar baz';
                        }
                    }, null, spooks.fn({ name: 'callback', log: log }));
                });

                test('write was called once', function () {
                    assert.strictEqual(log.counts.write, 1);
                });

                test('write was called correctly', function () {
                    assert.lengthOf(log.args.write[0], 1);
                    assert.strictEqual(log.args.write[0][0], 'foo bar baz');
                });

                test('callback was called once', function () {
                    assert.strictEqual(log.counts.callback, 1);
                });

                test('callback was called correctly', function () {
                    assert.lengthOf(log.args.callback[0], 0);
                });
            });
        });
    });
});

