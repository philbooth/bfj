'use strict';

var assert, path, fs, modulePath;

assert = require('chai').assert;
path = require('path');
fs = require('fs');

modulePath = '../src';

suite('integration:', function () {
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

    test('require returns object', function () {
        assert.isObject(require(modulePath));
    });

    suite('require:', function () {
        var bfj;

        setup(function () {
            bfj = require(modulePath);
        });

        teardown(function () {
            bfj = undefined;
        });

        test('walk function is exported', function () {
            assert.isFunction(bfj.walk);
        });

        test('walk expects one argument', function () {
            assert.lengthOf(bfj.walk, 2);
        });

        test('parse function is exported', function () {
            assert.isFunction(bfj.parse);
        });

        test('parse expects two arguments', function () {
            assert.lengthOf(bfj.parse, 2);
        });

        test('read function is exported', function () {
            assert.isFunction(bfj.read);
        });

        test('read expects two arguments', function () {
            assert.lengthOf(bfj.read, 2);
        });

        test('eventify function is exported', function () {
            assert.isFunction(bfj.eventify);
        });

        test('eventify expects two arguments', function () {
            assert.lengthOf(bfj.eventify, 2);
        });

        test('streamify function is exported', function () {
            assert.isFunction(bfj.streamify);
        });

        test('streamify expects two arguments', function () {
            assert.lengthOf(bfj.streamify, 2);
        });

        test('stringify function is exported', function () {
            assert.isFunction(bfj.stringify);
        });

        test('stringify expects two arguments', function () {
            assert.lengthOf(bfj.stringify, 2);
        });

        test('write function is exported', function () {
            assert.isFunction(bfj.write);
        });

        test('write expects two arguments', function () {
            assert.lengthOf(bfj.write, 3);
        });

        test('events are exported', function () {
            assert.deepEqual(bfj.events, require('../src/events'));
        });

        suite('read object:', function () {
            var failed, file, result, error;

            setup(function (done) {
                failed = false;
                file = path.join(__dirname, 'data.json');
                fs.writeFileSync(file, JSON.stringify({
                    foo: [ 'b', 'a', 'r' ],
                    baz: null,
                    qux: 3.14159265359e42
                }, null, '\t'));
                bfj.read(file)
                    .then(function (r) {
                        result = r;
                        done();
                    })
                    .catch(function (e) {
                        failed = true;
                        error = e;
                        done();
                    });
            });

            teardown(function () {
                fs.unlinkSync(file);
                failed = file = result = error = undefined;
            });

            test('result was correct', function () {
                assert.isFalse(failed);
                assert.isUndefined(error);
                assert.isObject(result);
                assert.lengthOf(Object.keys(result), 3);
                assert.isArray(result.foo);
                assert.lengthOf(result.foo, 3);
                assert.strictEqual(result.foo[0], 'b');
                assert.strictEqual(result.foo[1], 'a');
                assert.strictEqual(result.foo[2], 'r');
                assert.isNull(result.baz);
                assert.strictEqual(result.qux, 3.14159265359e42);
            });
        });

        suite('read value:', function () {
            var failed, file, result, error;

            setup(function (done) {
                failed = false;
                file = path.join(__dirname, 'data.json');
                fs.writeFileSync(file, '"foo"');
                bfj.read(file)
                    .then(function (r) {
                        result = r;
                        done();
                    })
                    .catch(function (e) {
                        failed = true;
                        error = e;
                        done();
                    });
            });

            teardown(function () {
                fs.unlinkSync(file);
                failed = file = result = error = undefined;
            });

            test('result was correct', function () {
                assert.isFalse(failed);
                assert.isUndefined(error);
                assert.strictEqual(result, 'foo');
            });
        });

        suite('read error:', function () {
            var failed, file, result, error;

            setup(function (done) {
                failed = false;
                file = path.join(__dirname, 'data.json');
                fs.writeFileSync(file, '"foo" "bar"');
                bfj.read(file)
                    .then(function (r) {
                        result = r;
                        done();
                    })
                    .catch(function (e) {
                        failed = true;
                        error = e;
                        done();
                    });
            });

            teardown(function () {
                fs.unlinkSync(file);
                failed = file = result = error = undefined;
            });

            test('result was correct', function () {
                assert.isTrue(failed);
                assert.isUndefined(result);
                assert.instanceOf(error, Error);
            });
        });

        suite('stringify value:', function () {
            var result;

            setup(function (done) {
                bfj.stringify(new Promise(function (resolve) {
                    setTimeout(resolve.bind(null, 'foo\t"\nbar'), 20);
                })).then(function (r) {
                    result = r;
                    done();
                });
            });

            teardown(function () {
                result = undefined;
            });

            test('result was correct', function () {
                assert.strictEqual(result, '"foo\\t\\"\\nbar"');
            });
        });

        suite('write object:', function () {
            var failed, file, result;

            setup(function (done) {
                failed = false;
                file = path.join(__dirname, 'data.json');
                bfj.write(
                    file,
                    { foo: [ 'b', 'a', 'r' ], baz: null, qux: 3.14159265359e42 }
                ).then(function () {
                    result = fs.readFileSync(file, { encoding: 'utf8' });
                    done();
                }).catch(function (error) {
                    failed = true;
                    result = error;
                    done();
                });
            });

            teardown(function () {
                fs.unlinkSync(file);
                failed = file = result = undefined;
            });

            test('did not fail', function () {
                assert.isFalse(failed);
            });

            test('result was correct', function () {
                assert.strictEqual(result, '{"foo":["b","a","r"],"baz":null,"qux":3.14159265359e+42}');
            });
        });
    });
});

