'use strict';

var assert, mockery, spooks, modulePath;

assert = require('chai').assert;
mockery = require('mockery');
spooks = require('spooks');

modulePath = '../../src/read';

mockery.registerAllowable(modulePath);

suite('read:', function () {
    var log, results;

    setup(function () {
        log = {};
        results = {
            parse: [ {} ],
            createReadStream: [ {} ]
        };

        mockery.enable({ useCleanCache: true });
        mockery.registerMock('fs', {
            createReadStream: spooks.fn({
                name: 'createReadStream',
                log: log,
                results: results.createReadStream
            })
        });
        mockery.registerMock('./parse', spooks.fn({
            name: 'parse',
            log: log,
            results: results.parse
        }));
    });

    teardown(function () {
        mockery.deregisterMock('./parse');
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
        var read;

        setup(function () {
            read = require(modulePath);
        });

        teardown(function () {
            read = undefined;
        });

        test('read expects two arguments', function () {
            assert.lengthOf(read, 2);
        });

        test('read does not throw', function () {
            assert.doesNotThrow(function () {
                read();
            });
        });

        test('parse was not called', function () {
            assert.strictEqual(log.counts.parse, 0);
        });

        test('fs.createReadStream was not called', function () {
            assert.strictEqual(log.counts.createReadStream, 0);
        });

        suite('read:', function () {
            var path, options, result;

            setup(function () {
                path = {};
                options = {};
                result = read(path, options);
            });

            teardown(function () {
                path = options = result = undefined;
            });

            test('fs.createReadStream was called once', function () {
                assert.strictEqual(log.counts.createReadStream, 1);
            });

            test('fs.createReadStream was called correctly', function () {
                assert.strictEqual(log.these.createReadStream[0], require('fs'));
                assert.lengthOf(log.args.createReadStream[0], 2);
                assert.strictEqual(log.args.createReadStream[0][0], path);
                assert.lengthOf(Object.keys(log.args.createReadStream[0][0]), 0);
                assert.strictEqual(log.args.createReadStream[0][1], options);
                assert.lengthOf(Object.keys(log.args.createReadStream[0][1]), 0);
            });

            test('parse was called once', function () {
                assert.strictEqual(log.counts.parse, 1);
            });

            test('parse was called correctly', function () {
                assert.isUndefined(log.these.parse[0]);
                assert.lengthOf(log.args.parse[0], 2);
                assert.strictEqual(log.args.parse[0][0], results.createReadStream[0]);
                assert.lengthOf(Object.keys(log.args.parse[0][0]), 0);
                assert.strictEqual(log.args.parse[0][1], options);
                assert.lengthOf(Object.keys(log.args.parse[0][1]), 0);
            });

            test('parse result was returned', function () {
                assert.strictEqual(result, results.parse[0]);
            });
        });
    });
});

