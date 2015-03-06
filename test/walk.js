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
            assert.isInstance(walk().stream, Writable);
        });

        test('walk returns emitter', function () {
            assert.isInstance(walk().emitter, EventEmitter);
        });

        suite('walk empty array:', function () {
            var stream, emitter;

            setup(function (done) {
                var result = walk();

                stream = result.stream;
                emitter = result.emitter;

                stream.write('[]');

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

        suite('walk badly-closed array:', function () {
            var stream, emitter;

            setup(function (done) {
                emitter = walk();

                stream = result.stream;
                emitter = result.emitter;

                stream.write('[}');

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
                assert.lengthOf(log.args.error[1], 1);
                assert.instanceOf(log.args.error[1][0], Error);
                assert.strictEqual(log.args.error[1][0].actual, 'EOF');
                assert.strictEqual(log.args.error[1][0].expected, ']');
                assert.strictEqual(log.args.error[1][0].lineNumber, 1);
                assert.strictEqual(log.args.error[1][0].columnNumber, 3);
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

            test('endArray event did not occur', function () {
                assert.strictEqual(log.counts.endArray, 0);
            });

            test('endObject event did not occur', function () {
                assert.strictEqual(log.counts.endObject, 0);
            });

            test('endPrefix event did not occur', function () {
                assert.strictEqual(log.counts.endPrefix, 0);
            });
        });

        suite('walk empty object:', function () {
            var stream, emitter;

            setup(function (done) {
                emitter = walk();

                stream = result.stream;
                emitter = result.emitter;

                stream.write('{}');

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

            test('end event was dispatched correctly', function () {
                assert.lengthOf(log.args.end[0], 0);
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

        suite('walk badly-closed object:', function () {
            var stream, emitter;

            setup(function (done) {
                emitter = walk();

                stream = result.stream;
                emitter = result.emitter;

                stream.write('{]');

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

            test('error event occurred three times', function () {
                assert.strictEqual(log.counts.error, 3);
            });

            test('error event was dispatched correctly first time', function () {
                assert.lengthOf(log.args.error[0], 1);
                assert.instanceOf(log.args.error[0][0], Error);
                assert.strictEqual(log.args.error[0][0].actual, ']');
                assert.strictEqual(log.args.error[0][0].expected, '"');
                assert.strictEqual(log.args.error[0][0].lineNumber, 1);
                assert.strictEqual(log.args.error[0][0].columnNumber, 2);
            });

            test('error event was dispatched correctly second time', function () {
                assert.lengthOf(log.args.error[1], 1);
                assert.instanceOf(log.args.error[1][0], Error);
                assert.strictEqual(log.args.error[1][0].actual, 'EOF');
                assert.strictEqual(log.args.error[1][0].expected, '"');
                assert.strictEqual(log.args.error[1][0].lineNumber, 1);
                assert.strictEqual(log.args.error[1][0].columnNumber, 3);
            });

            test('error event was dispatched correctly third time', function () {
                assert.lengthOf(log.args.error[2], 1);
                assert.instanceOf(log.args.error[2][0], Error);
                assert.strictEqual(log.args.error[2][0].actual, 'EOF');
                assert.strictEqual(log.args.error[2][0].expected, '}');
                assert.strictEqual(log.args.error[2][0].lineNumber, 1);
                assert.strictEqual(log.args.error[2][0].columnNumber, 3);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('end event was dispatched correctly', function () {
                assert.lengthOf(log.args.end[0], 0);
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

            test('endPrefix event did not occur', function () {
                assert.strictEqual(log.counts.endPrefix, 0);
            });
        });

        suite('walk string:', function () {
            var stream, emitter;

            setup(function (done) {
                emitter = walk();

                stream = result.stream;
                emitter = result.emitter;

                stream.write('"\\"the quick brown fox\r\n\\tjumps\\u00a0over the lazy\\u1680dog\\""');

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

            test('end event was dispatched correctly', function () {
                assert.lengthOf(log.args.end[0], 0);
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

        suite('walk string containing bad escape sequence:', function () {
            var stream, emitter;

            setup(function (done) {
                emitter = walk();

                stream = result.stream;
                emitter = result.emitter;

                stream.write('"\\"the quick brown fox\r\n\\tjumps over the lazy\\xdog\\""');

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
                assert.lengthOf(log.args.error[0], 1);
                assert.instanceOf(log.args.error[0][0], Error);
                assert.strictEqual(log.args.error[0][0].actual, 'x');
                assert.strictEqual(log.args.error[0][0].expected, 'escape character');
                assert.strictEqual(log.args.error[0][0].lineNumber, 2);
                assert.strictEqual(log.args.error[0][0].columnNumber, 23);
            });

            test('string event occurred once', function () {
                assert.strictEqual(log.counts.string, 1);
            });

            test('string event was dispatched correctly', function () {
                assert.lengthOf(log.args.string[0], 1);
                assert.strictEqual(log.args.string[0][0], '"the quick brown fox\r\n\tjumps over the lazy\\xdog"');
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('end event was dispatched correctly', function () {
                assert.lengthOf(log.args.end[0], 0);
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

            test('endPrefix event did not occur', function () {
                assert.strictEqual(log.counts.endPrefix, 0);
            });
        });

        suite('walk string containing bad unicode escape sequence:', function () {
            var stream, emitter;

            setup(function (done) {
                emitter = walk();

                stream = result.stream;
                emitter = result.emitter;

                stream.write('"\\u012g"');

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
                assert.lengthOf(log.args.error[0], 1);
                assert.instanceOf(log.args.error[0][0], Error);
                assert.strictEqual(log.args.error[0][0].actual, 'g');
                assert.strictEqual(log.args.error[0][0].expected, 'hex digit');
                assert.strictEqual(log.args.error[0][0].lineNumber, 1);
                assert.strictEqual(log.args.error[0][0].columnNumber, 7);
            });

            test('string event occurred once', function () {
                assert.strictEqual(log.counts.string, 1);
            });

            test('string event was dispatched correctly', function () {
                assert.lengthOf(log.args.string[0], 1);
                assert.strictEqual(log.args.string[0][0], '\\u012g');
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('end event was dispatched correctly', function () {
                assert.lengthOf(log.args.end[0], 0);
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

            test('endPrefix event did not occur', function () {
                assert.strictEqual(log.counts.endPrefix, 0);
            });
        });

        suite('walk unterminated string:', function () {
            var stream, emitter;

            setup(function (done) {
                emitter = walk();

                stream = result.stream;
                emitter = result.emitter;

                stream.write('"foo');

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
                assert.lengthOf(log.args.error[0], 1);
                assert.instanceOf(log.args.error[0][0], Error);
                assert.strictEqual(log.args.error[0][0].actual, 'EOF');
                assert.strictEqual(log.args.error[0][0].expected, '"');
                assert.strictEqual(log.args.error[0][0].lineNumber, 1);
                assert.strictEqual(log.args.error[0][0].columnNumber, 5);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('end event was dispatched correctly', function () {
                assert.lengthOf(log.args.end[0], 0);
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

            test('endPrefix event did not occur', function () {
                assert.strictEqual(log.counts.endPrefix, 0);
            });
        });

        suite('walk number:', function () {
            var stream, emitter;

            setup(function (done) {
                emitter = walk();

                stream = result.stream;
                emitter = result.emitter;

                stream.write('-3.14159265359e+42');

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

            test('end event was dispatched correctly', function () {
                assert.lengthOf(log.args.end[0], 0);
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

        suite('walk bad number:', function () {
            var stream, emitter;

            setup(function (done) {
                emitter = walk();

                stream = result.stream;
                emitter = result.emitter;

                stream.write('42f');

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
                assert.strictEqual(log.args.number[0][0], 42);
            });

            test('error event occurred twice', function () {
                assert.strictEqual(log.counts.error, 2);
            });

            test('error event was dispatched correctly first time', function () {
                assert.lengthOf(log.args.error[0], 1);
                assert.instanceOf(log.args.error[0][0], Error);
                assert.strictEqual(log.args.error[0][0].actual, 'f');
                assert.strictEqual(log.args.error[0][0].expected, 'EOF');
                assert.strictEqual(log.args.error[0][0].lineNumber, 1);
                assert.strictEqual(log.args.error[0][0].columnNumber, 3);
            });

            test('error event was dispatched correctly second time', function () {
                assert.lengthOf(log.args.error[1], 1);
                assert.instanceOf(log.args.error[1][0], Error);
                assert.strictEqual(log.args.error[1][0].actual, 'EOF');
                assert.strictEqual(log.args.error[1][0].expected, 'a');
                assert.strictEqual(log.args.error[1][0].lineNumber, 1);
                assert.strictEqual(log.args.error[1][0].columnNumber, 4);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('end event was dispatched correctly', function () {
                assert.lengthOf(log.args.end[0], 0);
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

            test('endPrefix event did not occur', function () {
                assert.strictEqual(log.counts.endPrefix, 0);
            });
        });

        suite('walk literal false:', function () {
            var stream, emitter;

            setup(function (done) {
                emitter = walk();

                stream = result.stream;
                emitter = result.emitter;

                stream.write('false');

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

            test('end event was dispatched correctly', function () {
                assert.lengthOf(log.args.end[0], 0);
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

        suite('walk literal null:', function () {
            var stream, emitter;

            setup(function (done) {
                emitter = walk();

                stream = result.stream;
                emitter = result.emitter;

                stream.write('null');

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
                assert.strictEqual(log.args.literal[0][0], null);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('end event was dispatched correctly', function () {
                assert.lengthOf(log.args.end[0], 0);
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

        suite('walk literal true:', function () {
            var stream, emitter;

            setup(function (done) {
                emitter = walk();

                stream = result.stream;
                emitter = result.emitter;

                stream.write('true');

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
                assert.strictEqual(log.args.literal[0][0], true);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('end event was dispatched correctly', function () {
                assert.lengthOf(log.args.end[0], 0);
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

        suite('walk bad literal false:', function () {
            var stream, emitter;

            setup(function (done) {
                emitter = walk();

                stream = result.stream;
                emitter = result.emitter;

                stream.write('falsd');

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
                assert.lengthOf(log.args.error[0], 1);
                assert.instanceOf(log.args.error[0][0], Error);
                assert.strictEqual(log.args.error[0][0].actual, 'd');
                assert.strictEqual(log.args.error[0][0].expected, 'e');
                assert.strictEqual(log.args.error[0][0].lineNumber, 1);
                assert.strictEqual(log.args.error[0][0].columnNumber, 5);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('end event was dispatched correctly', function () {
                assert.lengthOf(log.args.end[0], 0);
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

            test('endPrefix event did not occur', function () {
                assert.strictEqual(log.counts.endPrefix, 0);
            });
        });

        suite('walk bad literal null:', function () {
            var stream, emitter;

            setup(function (done) {
                emitter = walk();

                stream = result.stream;
                emitter = result.emitter;

                stream.write('nul');

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
                assert.lengthOf(log.args.error[0], 1);
                assert.instanceOf(log.args.error[0][0], Error);
                assert.strictEqual(log.args.error[0][0].actual, 'EOF');
                assert.strictEqual(log.args.error[0][0].expected, 'l');
                assert.strictEqual(log.args.error[0][0].lineNumber, 1);
                assert.strictEqual(log.args.error[0][0].columnNumber, 4);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('end event was dispatched correctly', function () {
                assert.lengthOf(log.args.end[0], 0);
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

            test('endPrefix event did not occur', function () {
                assert.strictEqual(log.counts.endPrefix, 0);
            });
        });

        suite('walk bad literal true:', function () {
            var stream, emitter;

            setup(function (done) {
                emitter = walk();

                stream = result.stream;
                emitter = result.emitter;

                stream.write('tRue');

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
                assert.lengthOf(log.args.error[0], 1);
                assert.instanceOf(log.args.error[0][0], Error);
                assert.strictEqual(log.args.error[0][0].actual, 'R');
                assert.strictEqual(log.args.error[0][0].expected, 'r');
                assert.strictEqual(log.args.error[0][0].lineNumber, 1);
                assert.strictEqual(log.args.error[0][0].columnNumber, 2);
            });

            test('error event was dispatched correctly second time', function () {
                assert.lengthOf(log.args.error[1], 1);
                assert.instanceOf(log.args.error[1][0], Error);
                assert.strictEqual(log.args.error[1][0].actual, 'u');
                assert.strictEqual(log.args.error[1][0].expected, 'EOF');
                assert.strictEqual(log.args.error[1][0].lineNumber, 1);
                assert.strictEqual(log.args.error[1][0].columnNumber, 3);
            });

            test('error event was dispatched correctly third time', function () {
                assert.lengthOf(log.args.error[2], 1);
                assert.instanceOf(log.args.error[2][0], Error);
                assert.strictEqual(log.args.error[2][0].actual, 'u');
                assert.strictEqual(log.args.error[2][0].expected, 'value');
                assert.strictEqual(log.args.error[2][0].lineNumber, 1);
                assert.strictEqual(log.args.error[2][0].columnNumber, 3);
            });

            test('error event was dispatched correctly fourth time', function () {
                assert.lengthOf(log.args.error[3], 1);
                assert.instanceOf(log.args.error[3][0], Error);
                assert.strictEqual(log.args.error[3][0].actual, 'e');
                assert.strictEqual(log.args.error[3][0].expected, 'value');
                assert.strictEqual(log.args.error[3][0].lineNumber, 1);
                assert.strictEqual(log.args.error[3][0].columnNumber, 4);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('end event was dispatched correctly', function () {
                assert.lengthOf(log.args.end[0], 0);
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

            test('endPrefix event did not occur', function () {
                assert.strictEqual(log.counts.endPrefix, 0);
            });
        });
    });

    function nop () {};
});

