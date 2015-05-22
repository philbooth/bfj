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
            streamify: [ {} ],
            createWriteStream: [ {} ],
            pipe: [ {} ]
        };
        results.streamify[0].pipe = spooks.fn({ name: 'pipe', log: log, results: results.pipe });

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
            results: results.streamify
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
                assert.strictEqual(log.these.pipe[0], results.streamify[0]);
            });

            test('stream.pipe was called correctly', function () {
                assert.lengthOf(log.args.pipe[0], 1);
                assert.strictEqual(log.args.pipe[0][0], results.createWriteStream[0]);
                assert.lengthOf(Object.keys(log.args.pipe[0][0]), 0);
            });

            test('stream.pipe result was returned', function () {
                assert.strictEqual(result, results.pipe[0]);
                assert.lengthOf(Object.keys(result), 0);
            });
        });
    });
});

