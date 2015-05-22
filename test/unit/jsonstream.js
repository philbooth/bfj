'use strict';

var assert, spooks, modulePath;

assert = require('chai').assert;
spooks = require('spooks');

modulePath = '../../src/jsonstream';

suite('jsonstream:', function () {
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
                Stream({ read: function () {} });
            });
        });

        test('calling Stream with new returns Stream instance', function () {
            assert.instanceOf(new Stream(function () {}), Stream);
        });

        test('calling Stream with new returns Readable instance', function () {
            assert.instanceOf(new Stream(function () {}), require('stream').Readable);
        });

        test('calling Stream without new returns Stream instance', function () {
            assert.instanceOf(Stream(function () {}), Stream);
        });

        suite('instantiate:', function () {
            var jsonstream;

            setup(function () {
                jsonstream = new Stream(spooks.fn({ name: 'read', log: log }));
            });

            teardown(function () {
                jsonstream = undefined;
            });

            test('jsonstream has _read method', function () {
                assert.isFunction(jsonstream._read);
            });

            test('_read expects no arguments', function () {
                assert.lengthOf(jsonstream._read, 0);
            });

            test('read was not called', function () {
                assert.strictEqual(log.counts.read, 0);
            });

            suite('jsonstream._read:', function () {
                setup(function () {
                    jsonstream._read();
                });

                test('read was called once', function () {
                    assert.strictEqual(log.counts.read, 1);
                    assert.isUndefined(log.these.read[0]);
                });

                test('read was called correctly', function () {
                    assert.lengthOf(log.args.read[0], 0);
                });
            });
        });
    });
});

