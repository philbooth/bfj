'use strict'

const assert = require('chai').assert
const mockery = require('mockery')
const spooks = require('spooks')

const modulePath = '../../src/read'

mockery.registerAllowable(modulePath)

suite('read:', () => {
  let log, results

  setup(() => {
    log = {}
    results = {
      parse: [ {} ],
      createReadStream: [ {} ]
    }

    mockery.enable({ useCleanCache: true })
    mockery.registerMock('fs', {
      createReadStream: spooks.fn({
        name: 'createReadStream',
        log: log,
        results: results.createReadStream
      })
    })
    mockery.registerMock('./parse', spooks.fn({
      name: 'parse',
      log: log,
      results: results.parse
    }))
  })

  teardown(() => {
    mockery.deregisterMock('./parse')
    mockery.deregisterMock('fs')
    mockery.disable()

    log = results = undefined
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
    let read

    setup(() => {
      read = require(modulePath)
    })

    teardown(() => {
      read = undefined
    })

    test('read expects two arguments', () => {
      assert.lengthOf(read, 2)
    })

    test('read does not throw', () => {
      assert.doesNotThrow(() => {
        read()
      })
    })

    test('parse was not called', () => {
      assert.strictEqual(log.counts.parse, 0)
    })

    test('fs.createReadStream was not called', () => {
      assert.strictEqual(log.counts.createReadStream, 0)
    })

    suite('read:', () => {
      let path, options, result

      setup(() => {
        path = {}
        options = {}
        result = read(path, options)
      })

      teardown(() => {
        path = options = result = undefined
      })

      test('fs.createReadStream was called once', () => {
        assert.strictEqual(log.counts.createReadStream, 1)
      })

      test('fs.createReadStream was called correctly', () => {
        assert.strictEqual(log.these.createReadStream[0], require('fs'))
        assert.lengthOf(log.args.createReadStream[0], 2)
        assert.strictEqual(log.args.createReadStream[0][0], path)
        assert.lengthOf(Object.keys(log.args.createReadStream[0][0]), 0)
        assert.strictEqual(log.args.createReadStream[0][1], options)
        assert.lengthOf(Object.keys(log.args.createReadStream[0][1]), 0)
      })

      test('parse was called once', () => {
        assert.strictEqual(log.counts.parse, 1)
      })

      test('parse was called correctly', () => {
        assert.isUndefined(log.these.parse[0])
        assert.lengthOf(log.args.parse[0], 2)
        assert.strictEqual(log.args.parse[0][0], results.createReadStream[0])
        assert.lengthOf(Object.keys(log.args.parse[0][0]), 0)
        assert.strictEqual(log.args.parse[0][1], options)
        assert.lengthOf(Object.keys(log.args.parse[0][1]), 0)
      })

      test('parse result was returned', () => {
        assert.strictEqual(result, results.parse[0])
      })
    })
  })
})

suite('read with error thrown by fs.createReadStream:', () => {
  let read

  setup(() => {
    mockery.enable({ useCleanCache: true })
    mockery.registerMock('fs', {
      createReadStream () {
        throw new Error('foo')
      }
    })
    mockery.registerMock('./parse', () => {})
    read = require(modulePath)
  })

  teardown(() => {
    mockery.deregisterMock('fs')
    mockery.deregisterMock('./parse')
    mockery.disable()
  })

  test('read does not throw', () => {
    assert.doesNotThrow(() => {
      read().catch(() => {})
    })
  })

  test('read rejects', () => {
    read()
      .then(() => assert.fail('read should reject'))
      .catch(error => {
        assert.instanceOf(error, Error)
        assert.equal(error.message, 'foo')
      })
  })
})

