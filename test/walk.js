'use strict';

var assert, spooks, events, modulePath;

assert = require('chai').assert;
spooks = require('spooks');
events = require('../src/events');

modulePath = '../src/walk';

suite('walk:', function () {
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
        var walk;

        setup(function () {
            walk = require(modulePath);
        });

        teardown(function () {
            walk = undefined;
        });

        test('walk does not throw', function () {
            assert.doesNotThrow(function () {
                walk();
            });
        });

        test('walk returns object', function () {
            assert.isObject(walk());
        });

        test('walk returns stream', function () {
            assert.instanceOf(walk().stream, require('stream').Writable);
        });

        test('walk returns emitter', function () {
            assert.instanceOf(walk().emitter, require('events').EventEmitter);
        });

        suite('empty array:', function () {
            var emitter, stream;

            setup(function (done) {
                var result = walk();

                emitter = result.emitter;
                stream = result.stream;

                stream.write('[]');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('array event occurred once', function () {
                assert.strictEqual(log.counts.array, 1);
            });

            test('array event was dispatched correctly', function () {
                assert.lengthOf(log.args.array[0], 0);
            });

            test('endArray event occurred once', function () {
                assert.strictEqual(log.counts.endArray, 1);
            });

            test('endArray event was dispatched correctly', function () {
                assert.lengthOf(log.args.endArray[0], 0);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('end event was dispatched correctly', function () {
                assert.lengthOf(log.args.end[0], 0);
            });

            test('object event did not occur', function () {
                assert.strictEqual(log.counts.object, 0);
            });

            test('property event did not occur', function () {
                assert.strictEqual(log.counts.property, 0);
            });

            test('string event did not occur', function () {
                assert.strictEqual(log.counts.string, 0);
            });

            test('number event did not occur', function () {
                assert.strictEqual(log.counts.number, 0);
            });

            test('literal event did not occur', function () {
                assert.strictEqual(log.counts.literal, 0);
            });

            test('endObject event did not occur', function () {
                assert.strictEqual(log.counts.endObject, 0);
            });

            test('error event did not occur', function () {
                assert.strictEqual(log.counts.error, 0);
            });

            test('endPrefix event did not occur', function () {
                assert.strictEqual(log.counts.endPrefix, 0);
            });
        });

        suite('empty object:', function () {
            var stream, emitter;

            setup(function (done) {
                var result = walk();

                stream = result.stream;
                emitter = result.emitter;

                stream.write('{}');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('object event occurred once', function () {
                assert.strictEqual(log.counts.object, 1);
            });

            test('object event was dispatched correctly', function () {
                assert.lengthOf(log.args.object[0], 0);
            });

            test('endObject event occurred once', function () {
                assert.strictEqual(log.counts.endObject, 1);
            });

            test('endObject event was dispatched correctly', function () {
                assert.lengthOf(log.args.endObject[0], 0);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('array event did not occur', function () {
                assert.strictEqual(log.counts.array, 0);
            });

            test('property event did not occur', function () {
                assert.strictEqual(log.counts.property, 0);
            });

            test('string event did not occur', function () {
                assert.strictEqual(log.counts.string, 0);
            });

            test('number event did not occur', function () {
                assert.strictEqual(log.counts.number, 0);
            });

            test('literal event did not occur', function () {
                assert.strictEqual(log.counts.literal, 0);
            });

            test('endArray event did not occur', function () {
                assert.strictEqual(log.counts.endArray, 0);
            });

            test('error event did not occur', function () {
                assert.strictEqual(log.counts.error, 0);
            });

            test('endPrefix event did not occur', function () {
                assert.strictEqual(log.counts.endPrefix, 0);
            });
        });

        suite('string:', function () {
            var stream, emitter;

            setup(function (done) {
                var result = walk();

                stream = result.stream;
                emitter = result.emitter;

                stream.write('"\\"the quick brown fox\r\n\\tjumps\\u00a0over the lazy\\u1680dog\\""');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('string event occurred once', function () {
                assert.strictEqual(log.counts.string, 1);
            });

            test('string event was dispatched correctly', function () {
                assert.lengthOf(log.args.string[0], 1);
                assert.strictEqual(log.args.string[0][0], '"the quick brown fox\r\n\tjumps\u00a0over the lazy\u1680dog"');
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('array event did not occur', function () {
                assert.strictEqual(log.counts.array, 0);
            });

            test('object event did not occur', function () {
                assert.strictEqual(log.counts.object, 0);
            });

            test('property event did not occur', function () {
                assert.strictEqual(log.counts.property, 0);
            });

            test('number event did not occur', function () {
                assert.strictEqual(log.counts.number, 0);
            });

            test('literal event did not occur', function () {
                assert.strictEqual(log.counts.literal, 0);
            });

            test('endArray event did not occur', function () {
                assert.strictEqual(log.counts.endArray, 0);
            });

            test('endObject event did not occur', function () {
                assert.strictEqual(log.counts.endObject, 0);
            });

            test('error event did not occur', function () {
                assert.strictEqual(log.counts.error, 0);
            });

            test('endPrefix event did not occur', function () {
                assert.strictEqual(log.counts.endPrefix, 0);
            });
        });

        suite('number:', function () {
            var stream, emitter;

            setup(function (done) {
                var result = walk();

                stream = result.stream;
                emitter = result.emitter;

                stream.write('-3.14159265359e+42');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('number event occurred once', function () {
                assert.strictEqual(log.counts.number, 1);
            });

            test('number event was dispatched correctly', function () {
                assert.lengthOf(log.args.number[0], 1);
                assert.strictEqual(log.args.number[0][0], -3.14159265359e+42);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('array event did not occur', function () {
                assert.strictEqual(log.counts.array, 0);
            });

            test('object event did not occur', function () {
                assert.strictEqual(log.counts.object, 0);
            });

            test('property event did not occur', function () {
                assert.strictEqual(log.counts.property, 0);
            });

            test('string event did not occur', function () {
                assert.strictEqual(log.counts.string, 0);
            });

            test('literal event did not occur', function () {
                assert.strictEqual(log.counts.literal, 0);
            });

            test('endArray event did not occur', function () {
                assert.strictEqual(log.counts.endArray, 0);
            });

            test('endObject event did not occur', function () {
                assert.strictEqual(log.counts.endObject, 0);
            });

            test('error event did not occur', function () {
                assert.strictEqual(log.counts.error, 0);
            });

            test('endPrefix event did not occur', function () {
                assert.strictEqual(log.counts.endPrefix, 0);
            });
        });

        suite('literal false:', function () {
            var stream, emitter;

            setup(function (done) {
                var result = walk();

                stream = result.stream;
                emitter = result.emitter;

                stream.write('false');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('literal event occurred once', function () {
                assert.strictEqual(log.counts.literal, 1);
            });

            test('literal event was dispatched correctly', function () {
                assert.lengthOf(log.args.literal[0], 1);
                assert.strictEqual(log.args.literal[0][0], false);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('array event did not occur', function () {
                assert.strictEqual(log.counts.array, 0);
            });

            test('object event did not occur', function () {
                assert.strictEqual(log.counts.object, 0);
            });

            test('property event did not occur', function () {
                assert.strictEqual(log.counts.property, 0);
            });

            test('string event did not occur', function () {
                assert.strictEqual(log.counts.string, 0);
            });

            test('number event did not occur', function () {
                assert.strictEqual(log.counts.number, 0);
            });

            test('endArray event did not occur', function () {
                assert.strictEqual(log.counts.endArray, 0);
            });

            test('endObject event did not occur', function () {
                assert.strictEqual(log.counts.endObject, 0);
            });

            test('error event did not occur', function () {
                assert.strictEqual(log.counts.error, 0);
            });

            test('endPrefix event did not occur', function () {
                assert.strictEqual(log.counts.endPrefix, 0);
            });
        });

        suite('literal null:', function () {
            var stream, emitter;

            setup(function (done) {
                var result = walk();

                stream = result.stream;
                emitter = result.emitter;

                stream.write('null');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('literal event occurred once', function () {
                assert.strictEqual(log.counts.literal, 1);
            });

            test('literal event was dispatched correctly', function () {
                assert.strictEqual(log.args.literal[0][0], null);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('array event did not occur', function () {
                assert.strictEqual(log.counts.array, 0);
            });

            test('object event did not occur', function () {
                assert.strictEqual(log.counts.object, 0);
            });

            test('property event did not occur', function () {
                assert.strictEqual(log.counts.property, 0);
            });

            test('string event did not occur', function () {
                assert.strictEqual(log.counts.string, 0);
            });

            test('number event did not occur', function () {
                assert.strictEqual(log.counts.number, 0);
            });

            test('endArray event did not occur', function () {
                assert.strictEqual(log.counts.endArray, 0);
            });

            test('endObject event did not occur', function () {
                assert.strictEqual(log.counts.endObject, 0);
            });

            test('error event did not occur', function () {
                assert.strictEqual(log.counts.error, 0);
            });

            test('endPrefix event did not occur', function () {
                assert.strictEqual(log.counts.endPrefix, 0);
            });
        });

        suite('literal true:', function () {
            var stream, emitter;

            setup(function (done) {
                var result = walk();

                stream = result.stream;
                emitter = result.emitter;

                stream.write('true');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('literal event occurred once', function () {
                assert.strictEqual(log.counts.literal, 1);
            });

            test('literal event was dispatched correctly', function () {
                assert.strictEqual(log.args.literal[0][0], true);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('array event did not occur', function () {
                assert.strictEqual(log.counts.array, 0);
            });

            test('object event did not occur', function () {
                assert.strictEqual(log.counts.object, 0);
            });

            test('property event did not occur', function () {
                assert.strictEqual(log.counts.property, 0);
            });

            test('string event did not occur', function () {
                assert.strictEqual(log.counts.string, 0);
            });

            test('number event did not occur', function () {
                assert.strictEqual(log.counts.number, 0);
            });

            test('endArray event did not occur', function () {
                assert.strictEqual(log.counts.endArray, 0);
            });

            test('endObject event did not occur', function () {
                assert.strictEqual(log.counts.endObject, 0);
            });

            test('error event did not occur', function () {
                assert.strictEqual(log.counts.error, 0);
            });

            test('endPrefix event did not occur', function () {
                assert.strictEqual(log.counts.endPrefix, 0);
            });
        });

        suite('badly-closed array:', function () {
            var stream, emitter;

            setup(function (done) {
                var result = walk();

                stream = result.stream;
                emitter = result.emitter;

                stream.write('[}');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('array event occurred once', function () {
                assert.strictEqual(log.counts.array, 1);
            });

            test('error event occurred twice', function () {
                assert.strictEqual(log.counts.error, 2);
            });

            test('error event was dispatched correctly first time', function () {
                assert.lengthOf(log.args.error[0], 1);
                assert.instanceOf(log.args.error[0][0], Error);
                assert.strictEqual(log.args.error[0][0].actual, '}');
                assert.strictEqual(log.args.error[0][0].expected, 'value');
                assert.strictEqual(log.args.error[0][0].lineNumber, 1);
                assert.strictEqual(log.args.error[0][0].columnNumber, 2);
            });

            test('error event was dispatched correctly second time', function () {
                assert.strictEqual(log.args.error[1][0].actual, 'EOF');
                assert.strictEqual(log.args.error[1][0].expected, ']');
                assert.strictEqual(log.args.error[1][0].lineNumber, 1);
                assert.strictEqual(log.args.error[1][0].columnNumber, 3);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('object event did not occur', function () {
                assert.strictEqual(log.counts.object, 0);
            });

            test('property event did not occur', function () {
                assert.strictEqual(log.counts.property, 0);
            });

            test('string event did not occur', function () {
                assert.strictEqual(log.counts.string, 0);
            });

            test('number event did not occur', function () {
                assert.strictEqual(log.counts.number, 0);
            });

            test('literal event did not occur', function () {
                assert.strictEqual(log.counts.literal, 0);
            });

            test('endArray event did not occur', function () {
                assert.strictEqual(log.counts.endArray, 0);
            });

            test('endObject event did not occur', function () {
                assert.strictEqual(log.counts.endObject, 0);
            });
        });

        suite('badly-closed object:', function () {
            var stream, emitter;

            setup(function (done) {
                var result = walk();

                stream = result.stream;
                emitter = result.emitter;

                stream.write('{]');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('object event occurred once', function () {
                assert.strictEqual(log.counts.object, 1);
            });

            test('error event occurred three times', function () {
                assert.strictEqual(log.counts.error, 3);
            });

            test('error event was dispatched correctly first time', function () {
                assert.strictEqual(log.args.error[0][0].actual, ']');
                assert.strictEqual(log.args.error[0][0].expected, '"');
                assert.strictEqual(log.args.error[0][0].lineNumber, 1);
                assert.strictEqual(log.args.error[0][0].columnNumber, 2);
            });

            test('error event was dispatched correctly second time', function () {
                assert.strictEqual(log.args.error[1][0].actual, 'EOF');
                assert.strictEqual(log.args.error[1][0].expected, '"');
                assert.strictEqual(log.args.error[1][0].lineNumber, 1);
                assert.strictEqual(log.args.error[1][0].columnNumber, 3);
            });

            test('error event was dispatched correctly third time', function () {
                assert.strictEqual(log.args.error[2][0].actual, 'EOF');
                assert.strictEqual(log.args.error[2][0].expected, '}');
                assert.strictEqual(log.args.error[2][0].lineNumber, 1);
                assert.strictEqual(log.args.error[2][0].columnNumber, 3);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('array event did not occur', function () {
                assert.strictEqual(log.counts.array, 0);
            });

            test('property event did not occur', function () {
                assert.strictEqual(log.counts.property, 0);
            });

            test('string event did not occur', function () {
                assert.strictEqual(log.counts.string, 0);
            });

            test('number event did not occur', function () {
                assert.strictEqual(log.counts.number, 0);
            });

            test('literal event did not occur', function () {
                assert.strictEqual(log.counts.literal, 0);
            });

            test('endArray event did not occur', function () {
                assert.strictEqual(log.counts.endArray, 0);
            });

            test('endObject event did not occur', function () {
                assert.strictEqual(log.counts.endObject, 0);
            });
        });

        suite('string containing bad escape sequence:', function () {
            var stream, emitter;

            setup(function (done) {
                var result = walk();

                stream = result.stream;
                emitter = result.emitter;

                stream.write('"\\"the quick brown fox\r\n\\tjumps over the lazy\\xdog\\""');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('error event occurred once', function () {
                assert.strictEqual(log.counts.error, 1);
            });

            test('error event was dispatched correctly', function () {
                assert.strictEqual(log.args.error[0][0].actual, 'x');
                assert.strictEqual(log.args.error[0][0].expected, 'escape character');
                assert.strictEqual(log.args.error[0][0].lineNumber, 2);
                assert.strictEqual(log.args.error[0][0].columnNumber, 23);
            });

            test('string event occurred once', function () {
                assert.strictEqual(log.counts.string, 1);
            });

            test('string event was dispatched correctly', function () {
                assert.strictEqual(log.args.string[0][0], '"the quick brown fox\r\n\tjumps over the lazy\\xdog"');
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('array event did not occur', function () {
                assert.strictEqual(log.counts.array, 0);
            });

            test('object event did not occur', function () {
                assert.strictEqual(log.counts.object, 0);
            });

            test('property event did not occur', function () {
                assert.strictEqual(log.counts.property, 0);
            });

            test('number event did not occur', function () {
                assert.strictEqual(log.counts.number, 0);
            });

            test('literal event did not occur', function () {
                assert.strictEqual(log.counts.literal, 0);
            });

            test('endArray event did not occur', function () {
                assert.strictEqual(log.counts.endArray, 0);
            });

            test('endObject event did not occur', function () {
                assert.strictEqual(log.counts.endObject, 0);
            });
        });

        suite('string containing bad unicode escape sequence:', function () {
            var stream, emitter;

            setup(function (done) {
                var result = walk();

                stream = result.stream;
                emitter = result.emitter;

                stream.write('"\\u012g"');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('error event occurred once', function () {
                assert.strictEqual(log.counts.error, 1);
            });

            test('error event was dispatched correctly', function () {
                assert.strictEqual(log.args.error[0][0].actual, 'g');
                assert.strictEqual(log.args.error[0][0].expected, 'hex digit');
                assert.strictEqual(log.args.error[0][0].lineNumber, 1);
                assert.strictEqual(log.args.error[0][0].columnNumber, 7);
            });

            test('string event occurred once', function () {
                assert.strictEqual(log.counts.string, 1);
            });

            test('string event was dispatched correctly', function () {
                assert.strictEqual(log.args.string[0][0], '\\u012g');
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('array event did not occur', function () {
                assert.strictEqual(log.counts.array, 0);
            });

            test('object event did not occur', function () {
                assert.strictEqual(log.counts.object, 0);
            });

            test('property event did not occur', function () {
                assert.strictEqual(log.counts.property, 0);
            });

            test('number event did not occur', function () {
                assert.strictEqual(log.counts.number, 0);
            });

            test('literal event did not occur', function () {
                assert.strictEqual(log.counts.literal, 0);
            });

            test('endArray event did not occur', function () {
                assert.strictEqual(log.counts.endArray, 0);
            });

            test('endObject event did not occur', function () {
                assert.strictEqual(log.counts.endObject, 0);
            });
        });

        suite('unterminated string:', function () {
            var stream, emitter;

            setup(function (done) {
                var result = walk();

                stream = result.stream;
                emitter = result.emitter;

                stream.write('"foo');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('error event occurred once', function () {
                assert.strictEqual(log.counts.error, 1);
            });

            test('error event was dispatched correctly', function () {
                assert.strictEqual(log.args.error[0][0].actual, 'EOF');
                assert.strictEqual(log.args.error[0][0].expected, '"');
                assert.strictEqual(log.args.error[0][0].lineNumber, 1);
                assert.strictEqual(log.args.error[0][0].columnNumber, 5);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('array event did not occur', function () {
                assert.strictEqual(log.counts.array, 0);
            });

            test('object event did not occur', function () {
                assert.strictEqual(log.counts.object, 0);
            });

            test('property event did not occur', function () {
                assert.strictEqual(log.counts.property, 0);
            });

            test('string event did not occur', function () {
                assert.strictEqual(log.counts.string, 0);
            });

            test('number event did not occur', function () {
                assert.strictEqual(log.counts.number, 0);
            });

            test('literal event did not occur', function () {
                assert.strictEqual(log.counts.literal, 0);
            });

            test('endArray event did not occur', function () {
                assert.strictEqual(log.counts.endArray, 0);
            });

            test('endObject event did not occur', function () {
                assert.strictEqual(log.counts.endObject, 0);
            });
        });

        suite('bad number:', function () {
            var stream, emitter;

            setup(function (done) {
                var result = walk();

                stream = result.stream;
                emitter = result.emitter;

                stream.write('42f');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('number event occurred once', function () {
                assert.strictEqual(log.counts.number, 1);
            });

            test('number event was dispatched correctly', function () {
                assert.strictEqual(log.args.number[0][0], 42);
            });

            test('error event occurred twice', function () {
                assert.strictEqual(log.counts.error, 2);
            });

            test('error event was dispatched correctly first time', function () {
                assert.strictEqual(log.args.error[0][0].actual, 'f');
                assert.strictEqual(log.args.error[0][0].expected, 'EOF');
                assert.strictEqual(log.args.error[0][0].lineNumber, 1);
                assert.strictEqual(log.args.error[0][0].columnNumber, 3);
            });

            test('error event was dispatched correctly second time', function () {
                assert.strictEqual(log.args.error[1][0].actual, 'EOF');
                assert.strictEqual(log.args.error[1][0].expected, 'a');
                assert.strictEqual(log.args.error[1][0].lineNumber, 1);
                assert.strictEqual(log.args.error[1][0].columnNumber, 4);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('array event did not occur', function () {
                assert.strictEqual(log.counts.array, 0);
            });

            test('object event did not occur', function () {
                assert.strictEqual(log.counts.object, 0);
            });

            test('property event did not occur', function () {
                assert.strictEqual(log.counts.property, 0);
            });

            test('string event did not occur', function () {
                assert.strictEqual(log.counts.string, 0);
            });

            test('literal event did not occur', function () {
                assert.strictEqual(log.counts.literal, 0);
            });

            test('endArray event did not occur', function () {
                assert.strictEqual(log.counts.endArray, 0);
            });

            test('endObject event did not occur', function () {
                assert.strictEqual(log.counts.endObject, 0);
            });
        });

        suite('bad literal false:', function () {
            var stream, emitter;

            setup(function (done) {
                var result = walk();

                stream = result.stream;
                emitter = result.emitter;

                stream.write('falsd');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('error event occurred once', function () {
                assert.strictEqual(log.counts.error, 1);
            });

            test('error event was dispatched correctly', function () {
                assert.strictEqual(log.args.error[0][0].actual, 'd');
                assert.strictEqual(log.args.error[0][0].expected, 'e');
                assert.strictEqual(log.args.error[0][0].lineNumber, 1);
                assert.strictEqual(log.args.error[0][0].columnNumber, 5);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('array event did not occur', function () {
                assert.strictEqual(log.counts.array, 0);
            });

            test('object event did not occur', function () {
                assert.strictEqual(log.counts.object, 0);
            });

            test('property event did not occur', function () {
                assert.strictEqual(log.counts.property, 0);
            });

            test('string event did not occur', function () {
                assert.strictEqual(log.counts.string, 0);
            });

            test('number event did not occur', function () {
                assert.strictEqual(log.counts.number, 0);
            });

            test('literal event did not occur', function () {
                assert.strictEqual(log.counts.literal, 0);
            });

            test('endArray event did not occur', function () {
                assert.strictEqual(log.counts.endArray, 0);
            });

            test('endObject event did not occur', function () {
                assert.strictEqual(log.counts.endObject, 0);
            });
        });

        suite('bad literal null:', function () {
            var stream, emitter;

            setup(function (done) {
                var result = walk();

                stream = result.stream;
                emitter = result.emitter;

                stream.write('nul');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('error event occurred once', function () {
                assert.strictEqual(log.counts.error, 1);
            });

            test('error event was dispatched correctly', function () {
                assert.strictEqual(log.args.error[0][0].actual, 'EOF');
                assert.strictEqual(log.args.error[0][0].expected, 'l');
                assert.strictEqual(log.args.error[0][0].lineNumber, 1);
                assert.strictEqual(log.args.error[0][0].columnNumber, 4);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('array event did not occur', function () {
                assert.strictEqual(log.counts.array, 0);
            });

            test('object event did not occur', function () {
                assert.strictEqual(log.counts.object, 0);
            });

            test('property event did not occur', function () {
                assert.strictEqual(log.counts.property, 0);
            });

            test('string event did not occur', function () {
                assert.strictEqual(log.counts.string, 0);
            });

            test('number event did not occur', function () {
                assert.strictEqual(log.counts.number, 0);
            });

            test('literal event did not occur', function () {
                assert.strictEqual(log.counts.literal, 0);
            });

            test('endArray event did not occur', function () {
                assert.strictEqual(log.counts.endArray, 0);
            });

            test('endObject event did not occur', function () {
                assert.strictEqual(log.counts.endObject, 0);
            });
        });

        suite('bad literal true:', function () {
            var stream, emitter;

            setup(function (done) {
                var result = walk();

                stream = result.stream;
                emitter = result.emitter;

                stream.write('tRue');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('error event occurred four times', function () {
                assert.strictEqual(log.counts.error, 4);
            });

            test('error event was dispatched correctly first time', function () {
                assert.strictEqual(log.args.error[0][0].actual, 'R');
                assert.strictEqual(log.args.error[0][0].expected, 'r');
                assert.strictEqual(log.args.error[0][0].lineNumber, 1);
                assert.strictEqual(log.args.error[0][0].columnNumber, 2);
            });

            test('error event was dispatched correctly second time', function () {
                assert.strictEqual(log.args.error[1][0].actual, 'u');
                assert.strictEqual(log.args.error[1][0].expected, 'EOF');
                assert.strictEqual(log.args.error[1][0].lineNumber, 1);
                assert.strictEqual(log.args.error[1][0].columnNumber, 3);
            });

            test('error event was dispatched correctly third time', function () {
                assert.strictEqual(log.args.error[2][0].actual, 'u');
                assert.strictEqual(log.args.error[2][0].expected, 'value');
                assert.strictEqual(log.args.error[2][0].lineNumber, 1);
                assert.strictEqual(log.args.error[2][0].columnNumber, 3);
            });

            test('error event was dispatched correctly fourth time', function () {
                assert.strictEqual(log.args.error[3][0].actual, 'e');
                assert.strictEqual(log.args.error[3][0].expected, 'value');
                assert.strictEqual(log.args.error[3][0].lineNumber, 1);
                assert.strictEqual(log.args.error[3][0].columnNumber, 4);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('array event did not occur', function () {
                assert.strictEqual(log.counts.array, 0);
            });

            test('object event did not occur', function () {
                assert.strictEqual(log.counts.object, 0);
            });

            test('property event did not occur', function () {
                assert.strictEqual(log.counts.property, 0);
            });

            test('string event did not occur', function () {
                assert.strictEqual(log.counts.string, 0);
            });

            test('number event did not occur', function () {
                assert.strictEqual(log.counts.number, 0);
            });

            test('literal event did not occur', function () {
                assert.strictEqual(log.counts.literal, 0);
            });

            test('endArray event did not occur', function () {
                assert.strictEqual(log.counts.endArray, 0);
            });

            test('endObject event did not occur', function () {
                assert.strictEqual(log.counts.endObject, 0);
            });
        });

        suite('array inside array:', function () {
            var emitter, stream;

            setup(function (done) {
                var result = walk();

                emitter = result.emitter;
                stream = result.stream;

                stream.write('[[]]');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('array event occurred twice', function () {
                assert.strictEqual(log.counts.array, 2);
            });

            test('endArray event occurred twice', function () {
                assert.strictEqual(log.counts.endArray, 2);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('object event did not occur', function () {
                assert.strictEqual(log.counts.object, 0);
            });

            test('string event did not occur', function () {
                assert.strictEqual(log.counts.string, 0);
            });

            test('property event did not occur', function () {
                assert.strictEqual(log.counts.property, 0);
            });

            test('literal event did not occur', function () {
                assert.strictEqual(log.counts.literal, 0);
            });

            test('number event did not occur', function () {
                assert.strictEqual(log.counts.number, 0);
            });

            test('endObject event did not occur', function () {
                assert.strictEqual(log.counts.endObject, 0);
            });

            test('error event did not occur', function () {
                assert.strictEqual(log.counts.error, 0);
            });
        });

        suite('two arrays inside array:', function () {
            var emitter, stream;

            setup(function (done) {
                var result = walk();

                emitter = result.emitter;
                stream = result.stream;

                stream.write('[[],[]]');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('array event occurred three times', function () {
                assert.strictEqual(log.counts.array, 3);
            });

            test('endArray event occurred three times', function () {
                assert.strictEqual(log.counts.endArray, 3);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('object event did not occur', function () {
                assert.strictEqual(log.counts.object, 0);
            });

            test('string event did not occur', function () {
                assert.strictEqual(log.counts.string, 0);
            });

            test('property event did not occur', function () {
                assert.strictEqual(log.counts.property, 0);
            });

            test('literal event did not occur', function () {
                assert.strictEqual(log.counts.literal, 0);
            });

            test('number event did not occur', function () {
                assert.strictEqual(log.counts.number, 0);
            });

            test('endObject event did not occur', function () {
                assert.strictEqual(log.counts.endObject, 0);
            });

            test('error event did not occur', function () {
                assert.strictEqual(log.counts.error, 0);
            });
        });

        suite('two arrays inside array with whitespace:', function () {
            var emitter, stream;

            setup(function (done) {
                var result = walk();

                emitter = result.emitter;
                stream = result.stream;

                stream.write(' [ [] , [] ] ');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('array event occurred three times', function () {
                assert.strictEqual(log.counts.array, 3);
            });

            test('endArray event occurred three times', function () {
                assert.strictEqual(log.counts.endArray, 3);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('object event did not occur', function () {
                assert.strictEqual(log.counts.object, 0);
            });

            test('string event did not occur', function () {
                assert.strictEqual(log.counts.string, 0);
            });

            test('property event did not occur', function () {
                assert.strictEqual(log.counts.property, 0);
            });

            test('literal event did not occur', function () {
                assert.strictEqual(log.counts.literal, 0);
            });

            test('number event did not occur', function () {
                assert.strictEqual(log.counts.number, 0);
            });

            test('endObject event did not occur', function () {
                assert.strictEqual(log.counts.endObject, 0);
            });

            test('error event did not occur', function () {
                assert.strictEqual(log.counts.error, 0);
            });
        });

        suite('two arrays inside array without comma:', function () {
            var emitter, stream;

            setup(function (done) {
                var result = walk();

                emitter = result.emitter;
                stream = result.stream;

                stream.write('[[][]]');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('array event occurred three times', function () {
                assert.strictEqual(log.counts.array, 3);
            });

            test('endArray event occurred three times', function () {
                assert.strictEqual(log.counts.endArray, 3);
            });

            test('error event occurred once', function () {
                assert.strictEqual(log.counts.error, 1);
            });

            test('error event was dispatched correctly', function () {
                assert.strictEqual(log.args.error[0][0].actual, '[');
                assert.strictEqual(log.args.error[0][0].expected, ',');
                assert.strictEqual(log.args.error[0][0].lineNumber, 1);
                assert.strictEqual(log.args.error[0][0].columnNumber, 4);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('object event did not occur', function () {
                assert.strictEqual(log.counts.object, 0);
            });

            test('string event did not occur', function () {
                assert.strictEqual(log.counts.string, 0);
            });

            test('property event did not occur', function () {
                assert.strictEqual(log.counts.property, 0);
            });

            test('literal event did not occur', function () {
                assert.strictEqual(log.counts.literal, 0);
            });

            test('number event did not occur', function () {
                assert.strictEqual(log.counts.number, 0);
            });

            test('endObject event did not occur', function () {
                assert.strictEqual(log.counts.endObject, 0);
            });
        });

        suite('object inside array:', function () {
            var emitter, stream;

            setup(function (done) {
                var result = walk();

                emitter = result.emitter;
                stream = result.stream;

                stream.write('[{}]');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('array event occurred once', function () {
                assert.strictEqual(log.counts.array, 1);
            });

            test('object event occurred once', function () {
                assert.strictEqual(log.counts.object, 1);
            });

            test('endObject event occurred once', function () {
                assert.strictEqual(log.counts.endObject, 1);
            });

            test('endArray event occurred once', function () {
                assert.strictEqual(log.counts.endArray, 1);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('string event did not occur', function () {
                assert.strictEqual(log.counts.string, 0);
            });

            test('property event did not occur', function () {
                assert.strictEqual(log.counts.property, 0);
            });

            test('literal event did not occur', function () {
                assert.strictEqual(log.counts.literal, 0);
            });

            test('number event did not occur', function () {
                assert.strictEqual(log.counts.number, 0);
            });

            test('error event did not occur', function () {
                assert.strictEqual(log.counts.error, 0);
            });
        });

        suite('two objects inside array:', function () {
            var emitter, stream;

            setup(function (done) {
                var result = walk();

                emitter = result.emitter;
                stream = result.stream;

                stream.write('[{},{}]');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('array event occurred once', function () {
                assert.strictEqual(log.counts.array, 1);
            });

            test('object event occurred twice', function () {
                assert.strictEqual(log.counts.object, 2);
            });

            test('endObject event occurred twice', function () {
                assert.strictEqual(log.counts.endObject, 2);
            });

            test('endArray event occurred once', function () {
                assert.strictEqual(log.counts.endArray, 1);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('string event did not occur', function () {
                assert.strictEqual(log.counts.string, 0);
            });

            test('property event did not occur', function () {
                assert.strictEqual(log.counts.property, 0);
            });

            test('literal event did not occur', function () {
                assert.strictEqual(log.counts.literal, 0);
            });

            test('number event did not occur', function () {
                assert.strictEqual(log.counts.number, 0);
            });

            test('error event did not occur', function () {
                console.log(log.args.error);
                assert.strictEqual(log.counts.error, 0);
            });
        });

        suite('two objects inside array with whitespace:', function () {
            var emitter, stream;

            setup(function (done) {
                var result = walk();

                emitter = result.emitter;
                stream = result.stream;

                stream.write('\t[\t{}\t,\n{}\n]\n');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('array event occurred once', function () {
                assert.strictEqual(log.counts.array, 1);
            });

            test('object event occurred twice', function () {
                assert.strictEqual(log.counts.object, 2);
            });

            test('endObject event occurred twice', function () {
                assert.strictEqual(log.counts.endObject, 2);
            });

            test('endArray event occurred once', function () {
                assert.strictEqual(log.counts.endArray, 1);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('string event did not occur', function () {
                assert.strictEqual(log.counts.string, 0);
            });

            test('property event did not occur', function () {
                assert.strictEqual(log.counts.property, 0);
            });

            test('literal event did not occur', function () {
                assert.strictEqual(log.counts.literal, 0);
            });

            test('number event did not occur', function () {
                assert.strictEqual(log.counts.number, 0);
            });

            test('error event did not occur', function () {
                assert.strictEqual(log.counts.error, 0);
            });
        });

        suite('two objects inside array without comma:', function () {
            var emitter, stream;

            setup(function (done) {
                var result = walk();

                emitter = result.emitter;
                stream = result.stream;

                stream.write('[ {} {} ]');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('array event occurred once', function () {
                assert.strictEqual(log.counts.array, 1);
            });

            test('object event occurred twice', function () {
                assert.strictEqual(log.counts.object, 2);
            });

            test('endObject event occurred twice', function () {
                assert.strictEqual(log.counts.endObject, 2);
            });

            test('error event occurred once', function () {
                assert.strictEqual(log.counts.error, 1);
            });

            test('error event was dispatched correctly', function () {
                assert.strictEqual(log.args.error[0][0].actual, '{');
                assert.strictEqual(log.args.error[0][0].expected, ',');
                assert.strictEqual(log.args.error[0][0].lineNumber, 1);
                assert.strictEqual(log.args.error[0][0].columnNumber, 6);
            });

            test('endArray event occurred once', function () {
                assert.strictEqual(log.counts.endArray, 1);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('string event did not occur', function () {
                assert.strictEqual(log.counts.string, 0);
            });

            test('property event did not occur', function () {
                assert.strictEqual(log.counts.property, 0);
            });

            test('literal event did not occur', function () {
                assert.strictEqual(log.counts.literal, 0);
            });

            test('number event did not occur', function () {
                assert.strictEqual(log.counts.number, 0);
            });
        });

        suite('string inside array:', function () {
            var emitter, stream;

            setup(function (done) {
                var result = walk();

                emitter = result.emitter;
                stream = result.stream;

                stream.write('["foo"]');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('array event occurred once', function () {
                assert.strictEqual(log.counts.array, 1);
            });

            test('string event occurred once', function () {
                assert.strictEqual(log.counts.string, 1);
            });

            test('string event was dispatched correctly', function () {
                assert.strictEqual(log.args.string[0][0], 'foo');
            });

            test('endArray event occurred once', function () {
                assert.strictEqual(log.counts.endArray, 1);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('object event did not occur', function () {
                assert.strictEqual(log.counts.object, 0);
            });

            test('property event did not occur', function () {
                assert.strictEqual(log.counts.property, 0);
            });

            test('literal event did not occur', function () {
                assert.strictEqual(log.counts.literal, 0);
            });

            test('number event did not occur', function () {
                assert.strictEqual(log.counts.number, 0);
            });

            test('endObject event did not occur', function () {
                assert.strictEqual(log.counts.endObject, 0);
            });

            test('error event did not occur', function () {
                assert.strictEqual(log.counts.error, 0);
            });
        });

        suite('two strings inside array:', function () {
            var emitter, stream;

            setup(function (done) {
                var result = walk();

                emitter = result.emitter;
                stream = result.stream;

                stream.write('["foo","bar"]');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('array event occurred once', function () {
                assert.strictEqual(log.counts.array, 1);
            });

            test('string event occurred twice', function () {
                assert.strictEqual(log.counts.string, 2);
            });

            test('string event was dispatched correctly first time', function () {
                assert.strictEqual(log.args.string[0][0], 'foo');
            });

            test('string event was dispatched correctly second time', function () {
                assert.strictEqual(log.args.string[1][0], 'bar');
            });

            test('endArray event occurred once', function () {
                assert.strictEqual(log.counts.endArray, 1);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('object event did not occur', function () {
                assert.strictEqual(log.counts.object, 0);
            });

            test('property event did not occur', function () {
                assert.strictEqual(log.counts.property, 0);
            });

            test('literal event did not occur', function () {
                assert.strictEqual(log.counts.literal, 0);
            });

            test('number event did not occur', function () {
                assert.strictEqual(log.counts.number, 0);
            });

            test('endObject event did not occur', function () {
                assert.strictEqual(log.counts.endObject, 0);
            });

            test('error event did not occur', function () {
                console.log(log.args.error);
                assert.strictEqual(log.counts.error, 0);
            });
        });

        suite('two strings inside array with whitespace:', function () {
            var emitter, stream;

            setup(function (done) {
                var result = walk();

                emitter = result.emitter;
                stream = result.stream;

                stream.write('\r\n[ "baz" , "qux" ]\r\n');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('array event occurred once', function () {
                assert.strictEqual(log.counts.array, 1);
            });

            test('string event occurred twice', function () {
                assert.strictEqual(log.counts.string, 2);
            });

            test('string event was dispatched correctly first time', function () {
                assert.strictEqual(log.args.string[0][0], 'baz');
            });

            test('string event was dispatched correctly second time', function () {
                assert.strictEqual(log.args.string[1][0], 'qux');
            });

            test('endArray event occurred once', function () {
                assert.strictEqual(log.counts.endArray, 1);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('object event did not occur', function () {
                assert.strictEqual(log.counts.object, 0);
            });

            test('property event did not occur', function () {
                assert.strictEqual(log.counts.property, 0);
            });

            test('literal event did not occur', function () {
                assert.strictEqual(log.counts.literal, 0);
            });

            test('number event did not occur', function () {
                assert.strictEqual(log.counts.number, 0);
            });

            test('endObject event did not occur', function () {
                assert.strictEqual(log.counts.endObject, 0);
            });

            test('error event did not occur', function () {
                assert.strictEqual(log.counts.error, 0);
            });
        });

        suite('literal inside array:', function () {
            var emitter, stream;

            setup(function (done) {
                var result = walk();

                emitter = result.emitter;
                stream = result.stream;

                stream.write('[false]');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('array event occurred once', function () {
                assert.strictEqual(log.counts.array, 1);
            });

            test('literal event occurred once', function () {
                assert.strictEqual(log.counts.literal, 1);
            });

            test('literal event was dispatched correctly', function () {
                assert.strictEqual(log.args.literal[0][0], false);
            });

            test('endArray event occurred once', function () {
                assert.strictEqual(log.counts.endArray, 1);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('object event did not occur', function () {
                assert.strictEqual(log.counts.object, 0);
            });

            test('property event did not occur', function () {
                assert.strictEqual(log.counts.property, 0);
            });

            test('string event did not occur', function () {
                assert.strictEqual(log.counts.string, 0);
            });

            test('number event did not occur', function () {
                assert.strictEqual(log.counts.number, 0);
            });

            test('endObject event did not occur', function () {
                assert.strictEqual(log.counts.endObject, 0);
            });

            test('error event did not occur', function () {
                assert.strictEqual(log.counts.error, 0);
            });
        });

        suite('two literals inside array:', function () {
            var emitter, stream;

            setup(function (done) {
                var result = walk();

                emitter = result.emitter;
                stream = result.stream;

                stream.write('[true,null]');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('array event occurred once', function () {
                assert.strictEqual(log.counts.array, 1);
            });

            test('literal event occurred twice', function () {
                assert.strictEqual(log.counts.literal, 2);
            });

            test('literal event was dispatched correctly first time', function () {
                assert.strictEqual(log.args.literal[0][0], true);
            });

            test('literal event was dispatched correctly second time', function () {
                assert.strictEqual(log.args.literal[1][0], null);
            });

            test('endArray event occurred once', function () {
                assert.strictEqual(log.counts.endArray, 1);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('object event did not occur', function () {
                assert.strictEqual(log.counts.object, 0);
            });

            test('property event did not occur', function () {
                assert.strictEqual(log.counts.property, 0);
            });

            test('string event did not occur', function () {
                assert.strictEqual(log.counts.string, 0);
            });

            test('number event did not occur', function () {
                assert.strictEqual(log.counts.number, 0);
            });

            test('endObject event did not occur', function () {
                assert.strictEqual(log.counts.endObject, 0);
            });

            test('error event did not occur', function () {
                console.log(log.args.error);
                assert.strictEqual(log.counts.error, 0);
            });
        });

        suite('two literals inside array with whitespace:', function () {
            var emitter, stream;

            setup(function (done) {
                var result = walk();

                emitter = result.emitter;
                stream = result.stream;

                stream.write('[ null , false ]');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('array event occurred once', function () {
                assert.strictEqual(log.counts.array, 1);
            });

            test('literal event occurred twice', function () {
                assert.strictEqual(log.counts.literal, 2);
            });

            test('literal event was dispatched correctly first time', function () {
                assert.strictEqual(log.args.literal[0][0], null);
            });

            test('literal event was dispatched correctly second time', function () {
                assert.strictEqual(log.args.literal[1][0], false);
            });

            test('endArray event occurred once', function () {
                assert.strictEqual(log.counts.endArray, 1);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('object event did not occur', function () {
                assert.strictEqual(log.counts.object, 0);
            });

            test('property event did not occur', function () {
                assert.strictEqual(log.counts.property, 0);
            });

            test('string event did not occur', function () {
                assert.strictEqual(log.counts.string, 0);
            });

            test('number event did not occur', function () {
                assert.strictEqual(log.counts.number, 0);
            });

            test('endObject event did not occur', function () {
                assert.strictEqual(log.counts.endObject, 0);
            });

            test('error event did not occur', function () {
                assert.strictEqual(log.counts.error, 0);
            });
        });

        suite('number inside array:', function () {
            var emitter, stream;

            setup(function (done) {
                var result = walk();

                emitter = result.emitter;
                stream = result.stream;

                stream.write('[42]');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('array event occurred once', function () {
                assert.strictEqual(log.counts.array, 1);
            });

            test('number event occurred once', function () {
                assert.strictEqual(log.counts.number, 1);
            });

            test('number event was dispatched correctly', function () {
                assert.strictEqual(log.args.number[0][0], 42);
            });

            test('endArray event occurred once', function () {
                assert.strictEqual(log.counts.endArray, 1);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('object event did not occur', function () {
                assert.strictEqual(log.counts.object, 0);
            });

            test('property event did not occur', function () {
                assert.strictEqual(log.counts.property, 0);
            });

            test('string event did not occur', function () {
                assert.strictEqual(log.counts.string, 0);
            });

            test('literal event did not occur', function () {
                assert.strictEqual(log.counts.literal, 0);
            });

            test('endObject event did not occur', function () {
                assert.strictEqual(log.counts.endObject, 0);
            });

            test('error event did not occur', function () {
                assert.strictEqual(log.counts.error, 0);
            });
        });

        suite('two numbers inside array:', function () {
            var emitter, stream;

            setup(function (done) {
                var result = walk();

                emitter = result.emitter;
                stream = result.stream;

                stream.write('[0,1]');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('array event occurred once', function () {
                assert.strictEqual(log.counts.array, 1);
            });

            test('number event occurred twice', function () {
                assert.strictEqual(log.counts.number, 2);
            });

            test('number event was dispatched correctly first time', function () {
                assert.strictEqual(log.args.number[0][0], 0);
            });

            test('number event was dispatched correctly second time', function () {
                assert.strictEqual(log.args.number[1][0], 1);
            });

            test('endArray event occurred once', function () {
                assert.strictEqual(log.counts.endArray, 1);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('object event did not occur', function () {
                assert.strictEqual(log.counts.object, 0);
            });

            test('property event did not occur', function () {
                assert.strictEqual(log.counts.property, 0);
            });

            test('string event did not occur', function () {
                assert.strictEqual(log.counts.string, 0);
            });

            test('literal event did not occur', function () {
                assert.strictEqual(log.counts.literal, 0);
            });

            test('endObject event did not occur', function () {
                assert.strictEqual(log.counts.endObject, 0);
            });

            test('error event did not occur', function () {
                console.log(log.args.error);
                assert.strictEqual(log.counts.error, 0);
            });
        });

        suite('two numbers inside array with whitespace:', function () {
            var emitter, stream;

            setup(function (done) {
                var result = walk();

                emitter = result.emitter;
                stream = result.stream;

                stream.write('[ 1977 , -1977 ]');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('array event occurred once', function () {
                assert.strictEqual(log.counts.array, 1);
            });

            test('number event occurred twice', function () {
                assert.strictEqual(log.counts.number, 2);
            });

            test('number event was dispatched correctly first time', function () {
                assert.strictEqual(log.args.number[0][0], 1977);
            });

            test('number event was dispatched correctly second time', function () {
                assert.strictEqual(log.args.number[1][0], -1977);
            });

            test('endArray event occurred once', function () {
                assert.strictEqual(log.counts.endArray, 1);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('object event did not occur', function () {
                assert.strictEqual(log.counts.object, 0);
            });

            test('property event did not occur', function () {
                assert.strictEqual(log.counts.property, 0);
            });

            test('string event did not occur', function () {
                assert.strictEqual(log.counts.string, 0);
            });

            test('literal event did not occur', function () {
                assert.strictEqual(log.counts.literal, 0);
            });

            test('endObject event did not occur', function () {
                assert.strictEqual(log.counts.endObject, 0);
            });

            test('error event did not occur', function () {
                assert.strictEqual(log.counts.error, 0);
            });
        });

        suite('object inside object:', function () {
            var emitter, stream;

            setup(function (done) {
                var result = walk();

                emitter = result.emitter;
                stream = result.stream;

                stream.write('{"foo":{}}');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('object event occurred twice', function () {
                assert.strictEqual(log.counts.object, 2);
            });

            test('property event occurred once', function () {
                assert.strictEqual(log.counts.property, 1);
            });

            test('property event was dispatched correctly', function () {
                assert.lengthOf(log.args.property[0], 1);
                assert.strictEqual(log.args.property[0][0], 'foo');
            });

            test('endObject event occurred twice', function () {
                assert.strictEqual(log.counts.endObject, 2);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('array event did not occur', function () {
                assert.strictEqual(log.counts.array, 0);
            });

            test('string event did not occur', function () {
                assert.strictEqual(log.counts.string, 0);
            });

            test('literal event did not occur', function () {
                assert.strictEqual(log.counts.literal, 0);
            });

            test('number event did not occur', function () {
                assert.strictEqual(log.counts.number, 0);
            });

            test('endArray event did not occur', function () {
                assert.strictEqual(log.counts.endArray, 0);
            });

            test('error event did not occur', function () {
                assert.strictEqual(log.counts.error, 0);
            });
        });

        suite('array and object inside object:', function () {
            var emitter, stream;

            setup(function (done) {
                var result = walk();

                emitter = result.emitter;
                stream = result.stream;

                stream.write('{"wibble wobble":[],"jelly on the plate":{}}');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('object event occurred twice', function () {
                assert.strictEqual(log.counts.object, 2);
            });

            test('property event occurred twice', function () {
                assert.strictEqual(log.counts.property, 2);
            });

            test('property event was dispatched correctly first time', function () {
                assert.strictEqual(log.args.property[0][0], 'wibble wobble');
            });

            test('property event was dispatched correctly second time', function () {
                assert.strictEqual(log.args.property[1][0], 'jelly on the plate');
            });

            test('array event occurred once', function () {
                assert.strictEqual(log.counts.array, 1);
            });

            test('endArray event occurred once', function () {
                assert.strictEqual(log.counts.endArray, 1);
            });

            test('endObject event occurred twice', function () {
                assert.strictEqual(log.counts.endObject, 2);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('string event did not occur', function () {
                assert.strictEqual(log.counts.string, 0);
            });

            test('literal event did not occur', function () {
                assert.strictEqual(log.counts.literal, 0);
            });

            test('number event did not occur', function () {
                assert.strictEqual(log.counts.number, 0);
            });

            test('error event did not occur', function () {
                assert.strictEqual(log.counts.error, 0);
            });
        });

        suite('string, literal and number inside object with whitespace:', function () {
            var emitter, stream;

            setup(function (done) {
                var result = walk();

                emitter = result.emitter;
                stream = result.stream;

                stream.write('   { "foo" : "bar" ,\t"baz"\t:\tnull\t,\r\n"qux"\r\n:\r\n3.14159265359\r\n} ');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('object event occurred once', function () {
                assert.strictEqual(log.counts.object, 1);
            });

            test('property event occurred three times', function () {
                assert.strictEqual(log.counts.property, 3);
            });

            test('property event was dispatched correctly first time', function () {
                assert.strictEqual(log.args.property[0][0], 'foo');
            });

            test('property event was dispatched correctly second time', function () {
                assert.strictEqual(log.args.property[1][0], 'baz');
            });

            test('property event was dispatched correctly third time', function () {
                assert.strictEqual(log.args.property[2][0], 'qux');
            });

            test('string event occurred once', function () {
                assert.strictEqual(log.counts.string, 1);
            });

            test('string event was dispatched correctly', function () {
                assert.strictEqual(log.args.string[0][0], 'bar');
            });

            test('literal event occurred once', function () {
                assert.strictEqual(log.counts.literal, 1);
            });

            test('literal event was dispatched correctly', function () {
                assert.isNull(log.args.literal[0][0]);
            });

            test('number event occurred once', function () {
                assert.strictEqual(log.counts.number, 1);
            });

            test('number event was dispatched correctly', function () {
                assert.strictEqual(log.args.number[0][0], 3.14159265359);
            });

            test('endObject event occurred once', function () {
                assert.strictEqual(log.counts.endObject, 1);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('array event did not occur', function () {
                assert.strictEqual(log.counts.array, 0);
            });

            test('endArray event did not occur', function () {
                assert.strictEqual(log.counts.endArray, 0);
            });

            test('error event did not occur', function () {
                assert.strictEqual(log.counts.error, 0);
            });
        });

        suite('two objects inside object without comma:', function () {
            var emitter, stream;

            setup(function (done) {
                var result = walk();

                emitter = result.emitter;
                stream = result.stream;

                stream.write('{"foo":{}"bar":{}}');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('object event occurred three times', function () {
                assert.strictEqual(log.counts.object, 3);
            });

            test('property event occurred twice', function () {
                assert.strictEqual(log.counts.property, 2);
            });

            test('property event was dispatched correctly first time', function () {
                assert.strictEqual(log.args.property[0][0], 'foo');
            });

            test('property event was dispatched correctly second time', function () {
                assert.strictEqual(log.args.property[1][0], 'bar');
            });

            test('error event occurred once', function () {
                assert.strictEqual(log.counts.error, 1);
            });

            test('error event was dispatched correctly', function () {
                assert.strictEqual(log.args.error[0][0].actual, '"');
                assert.strictEqual(log.args.error[0][0].expected, ',');
                assert.strictEqual(log.args.error[0][0].lineNumber, 1);
                assert.strictEqual(log.args.error[0][0].columnNumber, 10);
            });

            test('endObject event occurred three times', function () {
                assert.strictEqual(log.counts.endObject, 3);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('array event did not occur', function () {
                assert.strictEqual(log.counts.array, 0);
            });

            test('string event did not occur', function () {
                assert.strictEqual(log.counts.string, 0);
            });

            test('literal event did not occur', function () {
                assert.strictEqual(log.counts.literal, 0);
            });

            test('number event did not occur', function () {
                assert.strictEqual(log.counts.number, 0);
            });

            test('endArray event did not occur', function () {
                assert.strictEqual(log.counts.endArray, 0);
            });
        });

        suite('unquoted property:', function () {
            var emitter, stream;

            setup(function (done) {
                var result = walk();

                emitter = result.emitter;
                stream = result.stream;

                stream.write('{foo:{}}');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('object event occurred once', function () {
                assert.strictEqual(log.counts.object, 1);
            });

            test('error event occurred once', function () {
                assert.strictEqual(log.counts.error, 3);
            });

            test('error event was dispatched correctly first time', function () {
                assert.strictEqual(log.args.error[0][0].actual, 'f');
                assert.strictEqual(log.args.error[0][0].expected, '"');
                assert.strictEqual(log.args.error[0][0].lineNumber, 1);
                assert.strictEqual(log.args.error[0][0].columnNumber, 2);
            });

            test('error event was dispatched correctly second time', function () {
                assert.strictEqual(log.args.error[1][0].actual, 'EOF');
                assert.strictEqual(log.args.error[1][0].expected, '"');
                assert.strictEqual(log.args.error[1][0].lineNumber, 1);
                assert.strictEqual(log.args.error[1][0].columnNumber, 9);
            });

            test('error event was dispatched correctly third time', function () {
                assert.strictEqual(log.args.error[2][0].actual, 'EOF');
                assert.strictEqual(log.args.error[2][0].expected, '}');
                assert.strictEqual(log.args.error[2][0].lineNumber, 1);
                assert.strictEqual(log.args.error[2][0].columnNumber, 9);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('array event did not occur', function () {
                assert.strictEqual(log.counts.array, 0);
            });

            test('property event did not occur', function () {
                assert.strictEqual(log.counts.property, 0);
            });

            test('string event did not occur', function () {
                assert.strictEqual(log.counts.string, 0);
            });

            test('literal event did not occur', function () {
                assert.strictEqual(log.counts.literal, 0);
            });

            test('number event did not occur', function () {
                assert.strictEqual(log.counts.number, 0);
            });

            test('endArray event did not occur', function () {
                assert.strictEqual(log.counts.endArray, 0);
            });

            test('endObject event did not occur', function () {
                assert.strictEqual(log.counts.endObject, 0);
            });
        });

        suite('duplicate property:', function () {
            var emitter, stream;

            setup(function (done) {
                var result = walk();

                emitter = result.emitter;
                stream = result.stream;

                // NOTE: RFC 7159 is wishy washy on the subject of duplicates:
                //
                //     "The names within an object SHOULD be unique
                //
                //     ...
                //
                //     An object whose names are all unique is interoperable
                //     in the sense that all software implementations receiving
                //     that object will agree on the name/value mappings. When
                //     the names within an object are not unique, the behavior
                //     of software that receives such an object is unpredictable.
                //     Many implementations report the last name/value pair only.
                //     Other implementations report an error or fail to parse the
                //     object, and some implementations report all of the name/value
                //     pairs, including duplicates."
                //
                //     https://tools.ietf.org/html/rfc7159#section-4
                stream.write('{"foo":{},"foo":{}}');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('object event occurred three times', function () {
                assert.strictEqual(log.counts.object, 3);
            });

            test('property event occurred twice', function () {
                assert.strictEqual(log.counts.property, 2);
            });

            test('property event was dispatched correctly first time', function () {
                assert.strictEqual(log.args.property[0][0], 'foo');
            });

            test('property event was dispatched correctly second time', function () {
                assert.strictEqual(log.args.property[1][0], 'foo');
            });

            test('endObject event occurred three times', function () {
                assert.strictEqual(log.counts.endObject, 3);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('array event did not occur', function () {
                assert.strictEqual(log.counts.array, 0);
            });

            test('string event did not occur', function () {
                assert.strictEqual(log.counts.string, 0);
            });

            test('literal event did not occur', function () {
                assert.strictEqual(log.counts.literal, 0);
            });

            test('number event did not occur', function () {
                assert.strictEqual(log.counts.number, 0);
            });

            test('error event did not occur', function () {
                assert.strictEqual(log.counts.error, 0);
            });
        });

        suite('empty string:', function () {
            var stream, emitter;

            setup(function (done) {
                var result = walk();

                stream = result.stream;
                emitter = result.emitter;

                stream.write('');
                stream.end();

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, function () { done(); });
            });

            teardown(function () {
                emitter = undefined;
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('array event did not occur', function () {
                assert.strictEqual(log.counts.array, 0);
            });

            test('object event did not occur', function () {
                assert.strictEqual(log.counts.object, 0);
            });

            test('property event did not occur', function () {
                assert.strictEqual(log.counts.property, 0);
            });

            test('string event did not occur', function () {
                assert.strictEqual(log.counts.string, 0);
            });

            test('number event did not occur', function () {
                assert.strictEqual(log.counts.number, 0);
            });

            test('literal event did not occur', function () {
                assert.strictEqual(log.counts.literal, 0);
            });

            test('endArray event did not occur', function () {
                assert.strictEqual(log.counts.endArray, 0);
            });

            test('endObject event did not occur', function () {
                assert.strictEqual(log.counts.endObject, 0);
            });

            test('error event did not occur', function () {
                assert.strictEqual(log.counts.error, 0);
            });
        });
    });

    function nop () {};
});

