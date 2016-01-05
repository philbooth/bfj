'use strict';

var assert, spooks, events, modulePath;

assert = require('chai').assert;
spooks = require('spooks');
events = require('../../src/events');

modulePath = '../../src/eventify';

suite('eventify:', function () {
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
        var eventify;

        setup(function () {
            eventify = require(modulePath);
        });

        teardown(function () {
            eventify = undefined;
        });

        test('eventify does not throw', function () {
            assert.doesNotThrow(function () {
                eventify();
            });
        });

        test('eventify returns EventEmitter', function () {
            assert.instanceOf(eventify(), require('events').EventEmitter);
        });

        suite('undefined:', function () {
            setup(function (done) {
                var emitter = eventify(undefined);

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, done);
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

            test('error event did not occur', function () {
                assert.strictEqual(log.counts.error, 0);
            });

            test('endPrefix event did not occur', function () {
                assert.strictEqual(log.counts.endPrefix, 0);
            });
        });

        suite('function:', function () {
            setup(function (done) {
                var emitter = eventify(function () {});

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, done);
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

            test('error event did not occur', function () {
                assert.strictEqual(log.counts.error, 0);
            });

            test('endPrefix event did not occur', function () {
                assert.strictEqual(log.counts.endPrefix, 0);
            });
        });

        suite('symbol:', function () {
            setup(function (done) {
                var emitter = eventify(Symbol('foo'));

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, done);
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

            test('error event did not occur', function () {
                assert.strictEqual(log.counts.error, 0);
            });

            test('endPrefix event did not occur', function () {
                assert.strictEqual(log.counts.endPrefix, 0);
            });
        });

        suite('empty array:', function () {
            setup(function (done) {
                var emitter = eventify([]);

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, done);
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
            setup(function (done) {
                var emitter = eventify({});

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, done);
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
            setup(function (done) {
                var emitter = eventify('foo');

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, done);
            });

            test('string event occurred once', function () {
                assert.strictEqual(log.counts.string, 1);
            });

            test('string event was dispatched correctly', function () {
                assert.lengthOf(log.args.string[0], 1);
                assert.strictEqual(log.args.string[0][0], 'foo');
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

        suite('string with special characters:', function () {
            setup(function (done) {
                var emitter = eventify('foo\nbar\t"baz"');

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, done);
            });

            test('string event occurred once', function () {
                assert.strictEqual(log.counts.string, 1);
            });

            test('string event was dispatched correctly', function () {
                assert.lengthOf(log.args.string[0], 1);
                assert.strictEqual(log.args.string[0][0], 'foo\\nbar\\t\\"baz\\"');
            });

            test('error event did not occur', function () {
                assert.strictEqual(log.counts.error, 0);
            });
        });

        suite('number:', function () {
            setup(function (done) {
                var emitter = eventify(42);

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, done);
            });

            test('number event occurred once', function () {
                assert.strictEqual(log.counts.number, 1);
            });

            test('number event was dispatched correctly', function () {
                assert.lengthOf(log.args.number[0], 1);
                assert.strictEqual(log.args.number[0][0], 42);
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

        suite('false:', function () {
            setup(function (done) {
                var emitter = eventify(false);

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, done);
            });

            test('literal event occurred once', function () {
                assert.strictEqual(log.counts.literal, 1);
            });

            test('literal event was dispatched correctly', function () {
                assert.lengthOf(log.args.literal[0], 1);
                assert.isFalse(log.args.literal[0][0]);
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

        suite('true:', function () {
            setup(function (done) {
                var emitter = eventify(true);

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, done);
            });

            test('literal event occurred once', function () {
                assert.strictEqual(log.counts.literal, 1);
            });

            test('literal event was dispatched correctly', function () {
                assert.isTrue(log.args.literal[0][0]);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('error event did not occur', function () {
                assert.strictEqual(log.counts.error, 0);
            });
        });

        suite('null:', function () {
            setup(function (done) {
                var emitter = eventify(null);

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, done);
            });

            test('literal event occurred once', function () {
                assert.strictEqual(log.counts.literal, 1);
            });

            test('literal event was dispatched correctly', function () {
                assert.isNull(log.args.literal[0][0]);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('error event did not occur', function () {
                assert.strictEqual(log.counts.error, 0);
            });
        });

        suite('array with items:', function () {
            setup(function (done) {
                var emitter = eventify([ undefined, 'foo', function () {}, 'bar', Symbol('baz') ]);

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, done);
            });

            test('array event occurred once', function () {
                assert.strictEqual(log.counts.array, 1);
            });

            test('literal event occurred three times', function () {
                assert.strictEqual(log.counts.literal, 3);
            });

            test('literal event was dispatched correctly first time', function () {
                assert.isNull(log.args.literal[0][0]);
            });

            test('literal event was dispatched correctly second time', function () {
                assert.isNull(log.args.literal[1][0]);
            });

            test('literal event was dispatched correctly third time', function () {
                assert.isNull(log.args.literal[2][0]);
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

            test('error event did not occur', function () {
                assert.strictEqual(log.counts.error, 0);
            });
        });

        suite('object with properties:', function () {
            setup(function (done) {
                var emitter = eventify({ foo: 42,
                    bar: undefined,
                    baz: 3.14159265359,
                    qux: Symbol('qux')
                });

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, done);
            });

            test('object event occurred once', function () {
                assert.strictEqual(log.counts.object, 1);
            });

            test('property event occurred twice', function () {
                assert.strictEqual(log.counts.property, 2);
            });

            test('property event was dispatched correctly first time', function () {
                assert.strictEqual(log.args.property[0][0], 'foo');
            });

            test('property event was dispatched correctly second time', function () {
                assert.strictEqual(log.args.property[1][0], 'baz');
            });

            test('number event occurred twice', function () {
                assert.strictEqual(log.counts.number, 2);
            });

            test('number event was dispatched correctly first time', function () {
                assert.strictEqual(log.args.number[0][0], 42);
            });

            test('number event was dispatched correctly second time', function () {
                assert.strictEqual(log.args.number[1][0], 3.14159265359);
            });

            test('endObject event occurred once', function () {
                assert.strictEqual(log.counts.endObject, 1);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('literal event did not occur', function () {
                assert.strictEqual(log.counts.literal, 0);
            });

            test('error event did not occur', function () {
                assert.strictEqual(log.counts.error, 0);
            });
        });

        suite('nested array:', function () {
            setup(function (done) {
                var emitter = eventify([ 'foo', [ 'bar', [ 'baz', 'qux' ] ] ]);

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, done);
            });

            test('array event occurred three times', function () {
                assert.strictEqual(log.counts.array, 3);
            });

            test('string event occurred four times', function () {
                assert.strictEqual(log.counts.string, 4);
            });

            test('string event was dispatched correctly first time', function () {
                assert.strictEqual(log.args.string[0][0], 'foo');
            });

            test('string event was dispatched correctly second time', function () {
                assert.strictEqual(log.args.string[1][0], 'bar');
            });

            test('string event was dispatched correctly third time', function () {
                assert.strictEqual(log.args.string[2][0], 'baz');
            });

            test('string event was dispatched correctly fourth time', function () {
                assert.strictEqual(log.args.string[3][0], 'qux');
            });

            test('endArray event occurred three times', function () {
                assert.strictEqual(log.counts.endArray, 3);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('error event did not occur', function () {
                assert.strictEqual(log.counts.error, 0);
            });
        });

        suite('nested object:', function () {
            setup(function (done) {
                var emitter = eventify({ foo: { bar: { baz: 1, qux: 2 }, wibble: 3 }, wobble: 4 });

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, done);
            });

            test('object event occurred three times', function () {
                assert.strictEqual(log.counts.object, 3);
            });

            test('property event occurred six times', function () {
                assert.strictEqual(log.counts.property, 6);
            });

            test('property event was dispatched correctly first time', function () {
                assert.strictEqual(log.args.property[0][0], 'foo');
            });

            test('property event was dispatched correctly second time', function () {
                assert.strictEqual(log.args.property[1][0], 'bar');
            });

            test('property event was dispatched correctly third time', function () {
                assert.strictEqual(log.args.property[2][0], 'baz');
            });

            test('property event was dispatched correctly fourth time', function () {
                assert.strictEqual(log.args.property[3][0], 'qux');
            });

            test('property event was dispatched correctly fifth time', function () {
                assert.strictEqual(log.args.property[4][0], 'wibble');
            });

            test('property event was dispatched correctly sixth time', function () {
                assert.strictEqual(log.args.property[5][0], 'wobble');
            });

            test('number event occurred four times', function () {
                assert.strictEqual(log.counts.number, 4);
            });

            test('number event was dispatched correctly first time', function () {
                assert.strictEqual(log.args.number[0][0], 1);
            });

            test('number event was dispatched correctly second time', function () {
                assert.strictEqual(log.args.number[1][0], 2);
            });

            test('number event was dispatched correctly third time', function () {
                assert.strictEqual(log.args.number[2][0], 3);
            });

            test('number event was dispatched correctly fourth time', function () {
                assert.strictEqual(log.args.number[3][0], 4);
            });

            test('endObject event occurred three times', function () {
                assert.strictEqual(log.counts.endObject, 3);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('error event did not occur', function () {
                assert.strictEqual(log.counts.error, 0);
            });
        });

        suite('promise:', function () {
            setup(function (done) {
                var emitter, resolve;

                emitter = eventify(new Promise(function (r) {
                    resolve = r;
                }), { poll: 4 });

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, done);

                setTimeout(resolve.bind(null, 'foo'), 20);
            });

            test('string event occurred once', function () {
                assert.strictEqual(log.counts.string, 1);
            });

            test('string event was dispatched correctly', function () {
                assert.lengthOf(log.args.string[0], 1);
                assert.strictEqual(log.args.string[0][0], 'foo');
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

        suite('ignore promise:', function () {
            setup(function (done) {
                var emitter, resolve;

                emitter = eventify(new Promise(function (r) {
                    resolve = r;
                }), { poll: 4, promises: 'ignore' });

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, done);

                setTimeout(resolve.bind(null, 'foo'), 20);
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

            test('endPrefix event did not occur', function () {
                assert.strictEqual(log.counts.endPrefix, 0);
            });
        });

        suite('buffer:', function () {
            setup(function (done) {
                var emitter, resolve;

                emitter = eventify(new Buffer('foo bar baz qux'));

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, done);
            });

            test('string event occurred once', function () {
                assert.strictEqual(log.counts.string, 1);
            });

            test('string event was dispatched correctly', function () {
                assert.lengthOf(log.args.string[0], 1);
                assert.strictEqual(log.args.string[0][0], 'foo bar baz qux');
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

        suite('ignore buffer:', function () {
            setup(function (done) {
                var emitter, resolve;

                emitter = eventify(new Buffer('foo bar baz qux'), { buffers: 'ignore' });

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, done);
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

            test('endPrefix event did not occur', function () {
                assert.strictEqual(log.counts.endPrefix, 0);
            });
        });

        suite('date:', function () {
            setup(function (done) {
                var emitter, resolve;

                emitter = eventify(new Date('1977-06-10T10:30:00.000Z'));

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, done);
            });

            test('string event occurred once', function () {
                assert.strictEqual(log.counts.string, 1);
            });

            test('string event was dispatched correctly', function () {
                assert.lengthOf(log.args.string[0], 1);
                assert.strictEqual(log.args.string[0][0], '1977-06-10T10:30:00.000Z');
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

        suite('ignore date:', function () {
            setup(function (done) {
                var emitter, resolve;

                emitter = eventify(new Date('1977-06-10T10:30:00.000Z'), { dates: 'ignore' });

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, done);
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

            test('endPrefix event did not occur', function () {
                assert.strictEqual(log.counts.endPrefix, 0);
            });
        });

        suite('map:', function () {
            setup(function (done) {
                var emitter, resolve;

                emitter = eventify(new Map([['foo','bar'],['baz','qux']]));

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, done);
            });

            test('object event occurred once', function () {
                assert.strictEqual(log.counts.object, 1);
            });

            test('property event occurred twice', function () {
                assert.strictEqual(log.counts.property, 2);
            });

            test('property event was dispatched correctly first time', function () {
                assert.strictEqual(log.args.property[0][0], 'foo');
            });

            test('property event was dispatched correctly second time', function () {
                assert.strictEqual(log.args.property[1][0], 'baz');
            });

            test('string event occurred twice', function () {
                assert.strictEqual(log.counts.string, 2);
            });

            test('string event was dispatched correctly first time', function () {
                assert.strictEqual(log.args.string[0][0], 'bar');
            });

            test('string event was dispatched correctly second time', function () {
                assert.strictEqual(log.args.string[1][0], 'qux');
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

        suite('ignore map:', function () {
            setup(function (done) {
                var emitter, resolve;

                emitter = eventify(new Map([['foo','bar'],['baz','qux']]), { maps: 'ignore' });

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, done);
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

            test('endPrefix event did not occur', function () {
                assert.strictEqual(log.counts.endPrefix, 0);
            });
        });

        suite('set:', function () {
            setup(function (done) {
                var emitter, resolve;

                emitter = eventify(new Set(['foo','bar']));

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, done);
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
                assert.strictEqual(log.counts.number, 0);
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

        suite('ignore set:', function () {
            setup(function (done) {
                var emitter, resolve;

                emitter = eventify(new Set(['foo','bar']), { iterables: 'ignore' });

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, done);
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

            test('endPrefix event did not occur', function () {
                assert.strictEqual(log.counts.endPrefix, 0);
            });
        });

        suite('promise resolved to a map:', function () {
            setup(function (done) {
                var emitter, resolve;

                emitter = eventify(new Promise(function (r) {
                    resolve = r;
                }), { poll: 4 });

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, done);

                setImmediate(resolve.bind(null, new Map([['foo','bar'],['baz','qux']])));
            });

            test('object event occurred once', function () {
                assert.strictEqual(log.counts.object, 1);
            });

            test('property event occurred twice', function () {
                assert.strictEqual(log.counts.property, 2);
            });

            test('property event was dispatched correctly first time', function () {
                assert.strictEqual(log.args.property[0][0], 'foo');
            });

            test('property event was dispatched correctly second time', function () {
                assert.strictEqual(log.args.property[1][0], 'baz');
            });

            test('string event occurred twice', function () {
                assert.strictEqual(log.counts.string, 2);
            });

            test('string event was dispatched correctly first time', function () {
                assert.strictEqual(log.args.string[0][0], 'bar');
            });

            test('string event was dispatched correctly second time', function () {
                assert.strictEqual(log.args.string[1][0], 'qux');
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

        suite('array circular reference:', function () {
            setup(function (done) {
                var array, emitter;

                array = [ 'foo' ];
                array[1] = array;
                emitter = eventify(array);

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, done);
            });

            test('array event occurred twice', function () {
                assert.strictEqual(log.counts.array, 2);
            });

            test('string event occurred once', function () {
                assert.strictEqual(log.counts.string, 1);
            });

            test('string event was dispatched correctly', function () {
                assert.strictEqual(log.args.string[0][0], 'foo');
            });

            test('endArray event occurred twice', function () {
                assert.strictEqual(log.counts.endArray, 2);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('error event occurred once', function () {
                assert.strictEqual(log.counts.error, 1);
            });

            test('error event was dispatched correctly', function () {
                assert.lengthOf(log.args.error[0], 1);
                assert.instanceOf(log.args.error[0][0], Error);
                assert.strictEqual(log.args.error[0][0].message, 'Circular reference.');
            });
        });

        suite('object circular reference:', function () {
            setup(function (done) {
                var object, emitter;

                object = { foo: 'bar' };
                object.self = object;
                emitter = eventify(object);

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, done);
            });

            test('object event occurred twice', function () {
                assert.strictEqual(log.counts.object, 2);
            });

            test('property event occurred twice', function () {
                assert.strictEqual(log.counts.property, 2);
            });

            test('property event was dispatched correctly first time', function () {
                assert.strictEqual(log.args.property[0][0], 'foo');
            });

            test('property event was dispatched correctly second time', function () {
                assert.strictEqual(log.args.property[1][0], 'self');
            });

            test('endObject event occurred twice', function () {
                assert.strictEqual(log.counts.endObject, 2);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('error event occurred once', function () {
                assert.strictEqual(log.counts.error, 1);
            });

            test('error event was dispatched correctly', function () {
                assert.strictEqual(log.args.error[0][0].message, 'Circular reference.');
            });
        });

        suite('array circular reference with ignore set:', function () {
            setup(function (done) {
                var array, emitter;

                array = [ 'foo' ];
                array[1] = array;
                emitter = eventify(array, { circular: 'ignore' });

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, done);
            });

            test('array event occurred twice', function () {
                assert.strictEqual(log.counts.array, 2);
            });

            test('string event occurred once', function () {
                assert.strictEqual(log.counts.string, 1);
            });

            test('endArray event occurred twice', function () {
                assert.strictEqual(log.counts.endArray, 2);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('error event did not occur', function () {
                assert.strictEqual(log.counts.error, 0);
            });
        });

        suite('object circular reference with ignore set:', function () {
            setup(function (done) {
                var object, emitter;

                object = { foo: 'bar' };
                object.self = object;
                emitter = eventify(object, { circular: 'ignore' });

                Object.keys(events).forEach(function (key) {
                    emitter.on(events[key], spooks.fn({
                        name: key,
                        log: log
                    }));
                });

                emitter.on(events.end, done);
            });

            test('object event occurred twice', function () {
                assert.strictEqual(log.counts.object, 2);
            });

            test('property event occurred twice', function () {
                assert.strictEqual(log.counts.property, 2);
            });

            test('endObject event occurred twice', function () {
                assert.strictEqual(log.counts.endObject, 2);
            });

            test('end event occurred once', function () {
                assert.strictEqual(log.counts.end, 1);
            });

            test('error event did not occur', function () {
                assert.strictEqual(log.counts.error, 0);
            });
        });
    });
});

