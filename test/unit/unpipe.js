'use strict'

const assert = require('chai').assert
const mockery = require('mockery')
const spooks = require('spooks')

const modulePath = '../../src/unpipe'

mockery.registerAllowable(modulePath)
mockery.registerAllowable('stream')

suite('unpipe:', () => {
  let log, results

  setup(() => {
    log = {}
    results = {
      parse: [ Promise.resolve() ]
    }

    mockery.enable({ useCleanCache: true })
    mockery.registerMock('./parse', spooks.fn({
      name: 'parse',
      log: log,
      results: results.parse
    }))
  })

  teardown(() => {
    mockery.deregisterMock('./parse')
    mockery.disable()
  })

  test('require does not throw', () => {
    assert.doesNotThrow(() => {
      require(modulePath)
    })
  })

  test('require returns function', () => {
    assert.isFunction(require(modulePath))
  })

  suite('require:', () => {
    let unpipe

    setup(() => {
      unpipe = require(modulePath)
    })

    teardown(() => {
      unpipe = undefined
    })

    test('unpipe expects two arguments', () => {
      assert.lengthOf(unpipe, 2)
    })

    test('unpipe does not throw', () => {
      assert.doesNotThrow(() => {
        unpipe(() => {})
      })
    })

    test('unpipe throws if callback is not provided', () => {
      assert.throws(() => {
        unpipe()
      })
    })

    test('parse was not called', () => {
      assert.strictEqual(log.counts.parse, 0)
    })

    suite('unpipe success:', () => {
      let result, error, options

      setup(done => {
        results.parse[0] = Promise.resolve('foo')
        options = {}
        unpipe((err, res) => {
          error = err
          result = res
          done()
        }, options)
      })

      test('parse was called once', () => {
        assert.strictEqual(log.counts.parse, 1)
      })

      test('parse was called correctly', () => {
        assert.isUndefined(log.these.parse[0])
        assert.lengthOf(log.args.parse[0], 2)
        assert.isObject(log.args.parse[0][0])
        assert.isTrue(log.args.parse[0][0].readable)
        assert.isTrue(log.args.parse[0][0].writable)
        assert.isFunction(log.args.parse[0][0].pipe)
        assert.isFunction(log.args.parse[0][0].read)
        assert.isFunction(log.args.parse[0][0]._read)
        assert.isFunction(log.args.parse[0][0].write)
        assert.isFunction(log.args.parse[0][0]._write)
        assert.strictEqual(log.args.parse[0][1], options)
        assert.lengthOf(Object.keys(log.args.parse[0][1]), 0)
      })

      test('parse result was returned', () => {
        assert.strictEqual(result, 'foo')
      })

      test('did not fail', () => {
        assert.isNull(error)
      })
    })

    suite('unpipe error:', () => {
      let result, error, options

      setup(done => {
        results.parse[0] = Promise.reject('bar')
        options = {}
        unpipe((err, res) => {
          error = err
          result = res
          done()
        }, options)
      })

      test('parse was called once', () => {
        assert.strictEqual(log.counts.parse, 1)
      })

      test('parse result was not returned', () => {
        assert.isUndefined(result)
      })

      test('failed', () => {
        assert.strictEqual(error, 'bar')
      })
    })
  })
})

