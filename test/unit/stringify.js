'use strict'

const assert = require('chai').assert
const proxyquire = require('proxyquire')
const spooks = require('spooks')
const Promise = require('bluebird')

const modulePath = '../../src/stringify'

suite('stringify:', () => {
  test('require does not throw', () => {
    assert.doesNotThrow(() => {
      require(modulePath)
    })
  })

  test('require returns function', () => {
    assert.isFunction(require(modulePath))
  })

  suite('require:', () => {
    let log, stringify

    setup(() => {
      log = {}

      stringify = proxyquire(modulePath, {
        './streamify': spooks.fn({
          name: 'streamify',
          log: log,
          results: [
            { on: spooks.fn({ name: 'on', log: log }) }
          ]
        })
      })
    })

    test('stringify expects two arguments', () => {
      assert.lengthOf(stringify, 2)
    })

    test('stringify does not throw', () => {
      assert.doesNotThrow(() => {
        stringify()
      })
    })

    test('stringify returns promise', () => {
      assert.instanceOf(stringify(), Promise)
    })

    test('streamify was not called', () => {
      assert.strictEqual(log.counts.streamify, 0)
    })

    suite('stringify:', () => {
      let data, options, resolved, rejected, result, done

      setup(() => {
        data = {}
        options = {}
        stringify(data, options)
          .then(res => {
            resolved = res
            done()
          })
          .catch(rej => {
            rejected = rej
            done()
          })
      })

      teardown(() => {
        data = options = resolved = rejected = result = done = undefined
      })

      test('streamify was called once', () => {
        assert.strictEqual(log.counts.streamify, 1)
        assert.isUndefined(log.these.streamify[0])
      })

      test('streamify was called correctly', () => {
        assert.lengthOf(log.args.streamify[0], 2)
        assert.strictEqual(log.args.streamify[0][0], data)
        assert.lengthOf(Object.keys(log.args.streamify[0][0]), 0)
        assert.strictEqual(log.args.streamify[0][1], options)
        assert.lengthOf(Object.keys(log.args.streamify[0][1]), 0)
      })

      test('stream.on was called three times', () => {
        assert.strictEqual(log.counts.on, 3)
      })

      test('stream.on was called correctly first time', () => {
        assert.lengthOf(log.args.on[0], 2)
        assert.strictEqual(log.args.on[0][0], 'data')
        assert.isFunction(log.args.on[0][1])
      })

      test('stream.on was called correctly second time', () => {
        assert.strictEqual(log.args.on[1][0], 'end')
        assert.isFunction(log.args.on[1][1])
        assert.notStrictEqual(log.args.on[1][1], log.args.on[0][1])
      })

      test('stream.on was called correctly third time', () => {
        assert.strictEqual(log.args.on[2][0], 'dataError')
        assert.isFunction(log.args.on[2][1])
        assert.notStrictEqual(log.args.on[2][1], log.args.on[0][1])
        assert.notStrictEqual(log.args.on[2][1], log.args.on[1][1])
      })

      test('promise is unfulfilled', () => {
        assert.isUndefined(resolved)
        assert.isUndefined(rejected)
      })

      suite('data event:', () => {
        setup(() => {
          log.args.on[0][1]('foo')
        })

        test('promise is unfulfilled', () => {
          assert.isUndefined(resolved)
          assert.isUndefined(rejected)
        })

        suite('end event:', () => {
          setup(d => {
            done = d
            log.args.on[1][1]()
          })

          test('promise is resolved', () => {
            assert.strictEqual(resolved, 'foo')
          })

          test('promise is not rejected', () => {
            assert.isUndefined(rejected)
          })
        })

        suite('data event:', () => {
          setup(() => {
            log.args.on[0][1]('bar')
          })

          test('promise is unfulfilled', () => {
            assert.isUndefined(resolved)
            assert.isUndefined(rejected)
          })

          suite('end event:', () => {
            setup(d => {
              done = d
              log.args.on[1][1]()
            })

            test('promise is resolved', () => {
              assert.strictEqual(resolved, 'foobar')
            })
          })

          suite('dataError event:', () => {
            setup(d => {
              done = d
              log.args.on[2][1]('wibble')
            })

            test('promise is rejected', () => {
              assert.strictEqual(rejected, 'wibble')
            })
          })
        })
      })
    })
  })
})

