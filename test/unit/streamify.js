'use strict'

const assert = require('chai').assert
const mockery = require('mockery')
const spooks = require('spooks')

const modulePath = '../../src/streamify'

mockery.registerAllowable(modulePath)
mockery.registerAllowable('./events')
mockery.registerAllowable('./time')

suite('streamify:', () => {
  let log, results

  setup(() => {
    log = {}
    results = {
      eventify: [
        { on: spooks.fn({ name: 'on', log: log }) }
      ],
      push: [ true ]
    }

    mockery.enable({ useCleanCache: true })
    mockery.registerMock('./eventify', spooks.fn({
      name: 'eventify',
      log: log,
      results: results.eventify
    }))
    mockery.registerMock('./jsonstream', spooks.ctor({
      name: 'JsonStream',
      log: log,
      archetype: { instance: { push: () => {}, emit: () => {} } },
      results: results
    }))
  })

  teardown(() => {
    mockery.deregisterMock('./jsonstream')
    mockery.deregisterMock('./eventify')
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
    let streamify

    setup(() => {
      streamify = require(modulePath)
    })

    teardown(() => {
      streamify = undefined
    })

    test('streamify expects two arguments', () => {
      assert.lengthOf(streamify, 2)
    })

    test('streamify does not throw', () => {
      assert.doesNotThrow(() => {
        streamify()
      })
    })

    test('streamify returns stream', () => {
      assert.strictEqual(streamify(), require('./jsonstream')())
    })

    test('JsonStream was not called', () => {
      assert.strictEqual(log.counts.JsonStream, 0)
    })

    test('eventify was not called', () => {
      assert.strictEqual(log.counts.eventify, 0)
    })

    test('EventEmitter.on was not called', () => {
      assert.strictEqual(log.counts.on, 0)
    })

    suite('streamify:', () => {
      let data, options, result

      setup(() => {
        data = {}
        options = {}
        result = streamify(data, options)
      })

      teardown(() => {
        data = options = result = undefined
      })

      test('JsonStream was called once', () => {
        assert.strictEqual(log.counts.JsonStream, 1)
        assert.isObject(log.these.JsonStream[0])
      })

      test('JsonStream was called correctly', () => {
        assert.lengthOf(log.args.JsonStream[0], 1)
        assert.isFunction(log.args.JsonStream[0][0])
      })

      test('eventify was called once', () => {
        assert.strictEqual(log.counts.eventify, 1)
        assert.isUndefined(log.these.eventify[0])
      })

      test('eventify was called correctly', () => {
        assert.lengthOf(log.args.eventify[0], 2)
        assert.strictEqual(log.args.eventify[0][0], data)
        assert.lengthOf(Object.keys(log.args.eventify[0][0]), 0)
        assert.strictEqual(log.args.eventify[0][1], options)
        assert.lengthOf(Object.keys(log.args.eventify[0][1]), 0)
      })

      test('EventEmitter.on was called ten times', () => {
        assert.strictEqual(log.counts.on, 10)
        assert.strictEqual(log.these.on[0], results.eventify[0])
        assert.strictEqual(log.these.on[1], results.eventify[0])
        assert.strictEqual(log.these.on[2], results.eventify[0])
        assert.strictEqual(log.these.on[3], results.eventify[0])
        assert.strictEqual(log.these.on[4], results.eventify[0])
        assert.strictEqual(log.these.on[5], results.eventify[0])
        assert.strictEqual(log.these.on[6], results.eventify[0])
        assert.strictEqual(log.these.on[7], results.eventify[0])
        assert.strictEqual(log.these.on[8], results.eventify[0])
        assert.strictEqual(log.these.on[9], results.eventify[0])
      })

      test('EventEmitter.on was called correctly first time', () => {
        assert.lengthOf(log.args.on[0], 2)
        assert.strictEqual(log.args.on[0][0], 'arr')
        assert.isFunction(log.args.on[0][1])
      })

      test('EventEmitter.on was called correctly second time', () => {
        assert.lengthOf(log.args.on[1], 2)
        assert.strictEqual(log.args.on[1][0], 'obj')
        assert.isFunction(log.args.on[1][1])
        assert.notStrictEqual(log.args.on[1][1], log.args.on[0][1])
      })

      test('EventEmitter.on was called correctly third time', () => {
        assert.lengthOf(log.args.on[2], 2)
        assert.strictEqual(log.args.on[2][0], 'pro')
        assert.isFunction(log.args.on[2][1])
        assert.notStrictEqual(log.args.on[2][1], log.args.on[0][1])
        assert.notStrictEqual(log.args.on[2][1], log.args.on[1][1])
      })

      test('EventEmitter.on was called correctly fourth time', () => {
        assert.lengthOf(log.args.on[3], 2)
        assert.strictEqual(log.args.on[3][0], 'str')
        assert.isFunction(log.args.on[3][1])
        assert.notStrictEqual(log.args.on[3][1], log.args.on[0][1])
        assert.notStrictEqual(log.args.on[3][1], log.args.on[1][1])
        assert.notStrictEqual(log.args.on[3][1], log.args.on[2][1])
      })

      test('EventEmitter.on was called correctly fifth time', () => {
        assert.lengthOf(log.args.on[4], 2)
        assert.strictEqual(log.args.on[4][0], 'num')
        assert.isFunction(log.args.on[4][1])
        assert.notStrictEqual(log.args.on[4][1], log.args.on[0][1])
        assert.notStrictEqual(log.args.on[4][1], log.args.on[1][1])
        assert.notStrictEqual(log.args.on[4][1], log.args.on[2][1])
        assert.notStrictEqual(log.args.on[4][1], log.args.on[3][1])
      })

      test('EventEmitter.on was called correctly sixth time', () => {
        assert.lengthOf(log.args.on[5], 2)
        assert.strictEqual(log.args.on[5][0], 'lit')
        assert.isFunction(log.args.on[5][1])
        assert.strictEqual(log.args.on[5][1], log.args.on[4][1])
      })

      test('EventEmitter.on was called correctly seventh time', () => {
        assert.lengthOf(log.args.on[6], 2)
        assert.strictEqual(log.args.on[6][0], 'end-arr')
        assert.isFunction(log.args.on[6][1])
        assert.notStrictEqual(log.args.on[6][1], log.args.on[0][1])
        assert.notStrictEqual(log.args.on[6][1], log.args.on[1][1])
        assert.notStrictEqual(log.args.on[6][1], log.args.on[2][1])
        assert.notStrictEqual(log.args.on[6][1], log.args.on[3][1])
        assert.notStrictEqual(log.args.on[6][1], log.args.on[4][1])
      })

      test('EventEmitter.on was called correctly eighth time', () => {
        assert.lengthOf(log.args.on[7], 2)
        assert.strictEqual(log.args.on[7][0], 'end-obj')
        assert.isFunction(log.args.on[7][1])
        assert.notStrictEqual(log.args.on[7][1], log.args.on[0][1])
        assert.notStrictEqual(log.args.on[7][1], log.args.on[1][1])
        assert.notStrictEqual(log.args.on[7][1], log.args.on[2][1])
        assert.notStrictEqual(log.args.on[7][1], log.args.on[3][1])
        assert.notStrictEqual(log.args.on[7][1], log.args.on[4][1])
        assert.notStrictEqual(log.args.on[7][1], log.args.on[6][1])
      })

      test('EventEmitter.on was called correctly ninth time', () => {
        assert.lengthOf(log.args.on[8], 2)
        assert.strictEqual(log.args.on[8][0], 'end')
        assert.isFunction(log.args.on[8][1])
        assert.notStrictEqual(log.args.on[8][1], log.args.on[0][1])
        assert.notStrictEqual(log.args.on[8][1], log.args.on[1][1])
        assert.notStrictEqual(log.args.on[8][1], log.args.on[2][1])
        assert.notStrictEqual(log.args.on[8][1], log.args.on[3][1])
        assert.notStrictEqual(log.args.on[8][1], log.args.on[4][1])
        assert.notStrictEqual(log.args.on[8][1], log.args.on[6][1])
        assert.notStrictEqual(log.args.on[8][1], log.args.on[7][1])
      })

      test('EventEmitter.on was called correctly tenth time', () => {
        assert.lengthOf(log.args.on[9], 2)
        assert.strictEqual(log.args.on[9][0], 'err')
        assert.isFunction(log.args.on[9][1])
        assert.notStrictEqual(log.args.on[9][1], log.args.on[0][1])
        assert.notStrictEqual(log.args.on[9][1], log.args.on[1][1])
        assert.notStrictEqual(log.args.on[9][1], log.args.on[2][1])
        assert.notStrictEqual(log.args.on[9][1], log.args.on[3][1])
        assert.notStrictEqual(log.args.on[9][1], log.args.on[4][1])
        assert.notStrictEqual(log.args.on[9][1], log.args.on[6][1])
        assert.notStrictEqual(log.args.on[9][1], log.args.on[7][1])
        assert.notStrictEqual(log.args.on[9][1], log.args.on[8][1])
      })

      suite('array event:', () => {
        setup(() => {
          log.args.on[0][1]()
        })

        test('stream.push was not called', () => {
          assert.strictEqual(log.counts.push, 0)
        })

        suite('end event:', () => {
          setup(() => {
            log.args.on[8][1]()
          })

          test('stream.push was not called', () => {
            assert.strictEqual(log.counts.push, 0)
          })

          suite('read stream:', () => {
            setup(() => {
              log.args.JsonStream[0][0]()
            })

            test('stream.push was called twice', () => {
              assert.strictEqual(log.counts.push, 2)
              assert.strictEqual(log.these.push[0], require('./jsonstream')())
              assert.strictEqual(log.these.push[1], require('./jsonstream')())
            })

            test('stream.push was called correctly first time', () => {
              assert.lengthOf(log.args.push[0], 2)
              assert.strictEqual(log.args.push[0][0], '[')
              assert.strictEqual(log.args.push[0][1], 'utf8')
            })

            test('stream.push was called correctly second time', () => {
              assert.lengthOf(log.args.push[1], 1)
              assert.isNull(log.args.push[1][0])
            })

            test('stream.emit was not called', () => {
              assert.strictEqual(log.counts.emit, 0)
            })
          })
        })

        suite('read stream:', () => {
          setup(() => {
            log.args.JsonStream[0][0]()
          })

          test('stream.push was not called', () => {
            assert.strictEqual(log.counts.push, 0)
          })

          suite('end event:', () => {
            setup(() => {
              log.args.on[8][1]()
            })

            test('stream.push was called twice', () => {
              assert.strictEqual(log.counts.push, 2)
            })

            test('stream.push was called correctly first time', () => {
              assert.strictEqual(log.args.push[0][0], '[')
            })

            test('stream.push was called correctly second time', () => {
              assert.isNull(log.args.push[1][0])
            })

            test('stream.emit was not called', () => {
              assert.strictEqual(log.counts.emit, 0)
            })
          })

          suite('string event:', () => {
            setup(() => {
              log.args.on[3][1]('foo')
            })

            test('stream.push was called once', () => {
              assert.strictEqual(log.counts.push, 1)
            })

            test('stream.push was called correctly', () => {
              assert.strictEqual(log.args.push[0][0], '["foo"')
            })

            suite('string event:', () => {
              setup(() => {
                log.args.on[3][1]('bar')
              })

              test('stream.push was called once', () => {
                assert.strictEqual(log.counts.push, 2)
              })

              test('stream.push was called correctly', () => {
                assert.strictEqual(log.args.push[1][0], ',"bar"')
              })
            })

            suite('array event:', () => {
              setup(() => {
                log.args.on[0][1]()
              })

              test('stream.push was called once', () => {
                assert.strictEqual(log.counts.push, 2)
              })

              test('stream.push was called correctly', () => {
                assert.strictEqual(log.args.push[1][0], ',[')
              })

              suite('array event:', () => {
                setup(() => {
                  log.args.on[0][1]()
                })

                test('stream.push was called once', () => {
                  assert.strictEqual(log.counts.push, 3)
                })

                test('stream.push was called correctly', () => {
                  assert.strictEqual(log.args.push[2][0], '[')
                })

                suite('endArray event:', () => {
                  setup(() => {
                    log.args.on[6][1]()
                  })

                  test('stream.push was called once', () => {
                    assert.strictEqual(log.counts.push, 4)
                  })

                  test('stream.push was called correctly', () => {
                    assert.strictEqual(log.args.push[3][0], ']')
                  })

                  suite('string event:', () => {
                    setup(() => {
                      log.args.on[3][1]('bar')
                    })

                    test('stream.push was called once', () => {
                      assert.strictEqual(log.counts.push, 5)
                    })

                    test('stream.push was called correctly', () => {
                      assert.strictEqual(log.args.push[4][0], ',"bar"')
                    })

                    suite('string event:', () => {
                      setup(() => {
                        log.args.on[3][1]('baz')
                      })

                      test('stream.push was called once', () => {
                        assert.strictEqual(log.counts.push, 6)
                      })

                      test('stream.push was called correctly', () => {
                        assert.strictEqual(log.args.push[5][0], ',"baz"')
                      })
                    })

                    suite('endArray event:', () => {
                      setup(() => {
                        log.args.on[6][1]()
                      })

                      test('stream.push was called once', () => {
                        assert.strictEqual(log.counts.push, 6)
                      })

                      test('stream.push was called correctly', () => {
                        assert.strictEqual(log.args.push[5][0], ']')
                      })

                      suite('string event:', () => {
                        setup(() => {
                          log.args.on[3][1]('baz')
                        })

                        test('stream.push was called once', () => {
                          assert.strictEqual(log.counts.push, 7)
                        })

                        test('stream.push was called correctly', () => {
                          assert.strictEqual(log.args.push[6][0], ',"baz"')
                        })

                        test('stream.emit was not called', () => {
                          assert.strictEqual(log.counts.emit, 0)
                        })
                      })
                    })
                  })
                })
              })
            })

            suite('object event:', () => {
              setup(() => {
                log.args.on[1][1]()
              })

              test('stream.push was called once', () => {
                assert.strictEqual(log.counts.push, 2)
              })

              test('stream.push was called correctly', () => {
                assert.strictEqual(log.args.push[1][0], ',{')
              })

              suite('property event:', () => {
                setup(() => {
                  log.args.on[2][1]('bar')
                })

                test('stream.push was called once', () => {
                  assert.strictEqual(log.counts.push, 3)
                })

                test('stream.push was called correctly', () => {
                  assert.strictEqual(log.args.push[2][0], '"bar":')
                })

                suite('string event:', () => {
                  setup(() => {
                    log.args.on[3][1]('baz')
                  })

                  test('stream.push was called once', () => {
                    assert.strictEqual(log.counts.push, 4)
                  })

                  test('stream.push was called correctly', () => {
                    assert.strictEqual(log.args.push[3][0], '"baz"')
                  })

                  suite('property event:', () => {
                    setup(() => {
                      log.args.on[2][1]('nested')
                    })

                    test('stream.push was called once', () => {
                      assert.strictEqual(log.counts.push, 5)
                    })

                    test('stream.push was called correctly', () => {
                      assert.strictEqual(log.args.push[4][0], ',"nested":')
                    })

                    suite('object event:', () => {
                      setup(() => {
                        log.args.on[1][1]()
                      })

                      test('stream.push was called once', () => {
                        assert.strictEqual(log.counts.push, 6)
                      })

                      test('stream.push was called correctly', () => {
                        assert.strictEqual(log.args.push[5][0], '{')
                      })

                      suite('endObject event:', () => {
                        setup(() => {
                          log.args.on[7][1]()
                        })

                        test('stream.push was called once', () => {
                          assert.strictEqual(log.counts.push, 7)
                        })

                        test('stream.push was called correctly', () => {
                          assert.strictEqual(log.args.push[6][0], '}')
                        })

                        suite('property event:', () => {
                          setup(() => {
                            log.args.on[2][1]('qux')
                          })

                          test('stream.push was called once', () => {
                            assert.strictEqual(log.counts.push, 8)
                          })

                          test('stream.push was called correctly', () => {
                            assert.strictEqual(log.args.push[7][0], ',"qux":')
                          })

                          suite('string event:', () => {
                            setup(() => {
                              log.args.on[3][1]('wibble')
                            })

                            test('stream.push was called once', () => {
                              assert.strictEqual(log.counts.push, 9)
                            })

                            test('stream.push was called correctly', () => {
                              assert.strictEqual(log.args.push[8][0], '"wibble"')
                            })
                          })
                        })

                        suite('endObject event:', () => {
                          setup(() => {
                            log.args.on[7][1]()
                          })

                          test('stream.push was called once', () => {
                            assert.strictEqual(log.counts.push, 8)
                          })

                          test('stream.push was called correctly', () => {
                            assert.strictEqual(log.args.push[7][0], '}')
                          })

                          suite('string event:', () => {
                            setup(() => {
                              log.args.on[3][1]('wibble')
                            })

                            test('stream.push was called once', () => {
                              assert.strictEqual(log.counts.push, 9)
                            })

                            test('stream.push was called correctly', () => {
                              assert.strictEqual(log.args.push[8][0], ',"wibble"')
                            })

                            test('stream.emit was not called', () => {
                              assert.strictEqual(log.counts.emit, 0)
                            })
                          })
                        })
                      })
                    })
                  })
                })
              })
            })
          })

          suite('string event, push returns false:', () => {
            setup(() => {
              results.push[0] = false
              log.args.on[3][1]('foo')
            })

            teardown(() => {
              results.push[0] = true
            })

            test('stream.push was called once', () => {
              assert.strictEqual(log.counts.push, 1)
            })

            test('stream.push was called correctly', () => {
              assert.strictEqual(log.args.push[0][0], '["foo"')
            })

            suite('string event:', () => {
              setup(() => {
                log.args.on[3][1]('bar')
              })

              test('stream.push was not called', () => {
                assert.strictEqual(log.counts.push, 1)
              })

              suite('read stream, endArrayEvent:', () => {
                setup(() => {
                  log.args.JsonStream[0][0]()
                  log.args.on[6][1]()
                })

                test('stream.push was called once', () => {
                  assert.strictEqual(log.counts.push, 2)
                })

                test('stream.push was called correctly', () => {
                  assert.strictEqual(log.args.push[1][0], ',"bar"]')
                })

                test('stream.emit was not called', () => {
                  assert.strictEqual(log.counts.emit, 0)
                })
              })

              suite('end event:', () => {
                setup(() => {
                  log.args.on[8][1]()
                })

                test('stream.push was not called', () => {
                  assert.strictEqual(log.counts.push, 1)
                })

                suite('read stream:', () => {
                  setup(() => {
                    log.args.JsonStream[0][0]()
                  })

                  test('stream.push was called once', () => {
                    assert.strictEqual(log.counts.push, 2)
                  })

                  test('stream.push was called correctly', () => {
                    assert.strictEqual(log.args.push[1][0], ',"bar"')
                  })

                  suite('read stream:', () => {
                    setup(() => {
                      log.args.JsonStream[0][0]()
                    })

                    test('stream.push was called once', () => {
                      assert.strictEqual(log.counts.push, 3)
                    })

                    test('stream.push was called correctly', () => {
                      assert.isNull(log.args.push[2][0])
                    })

                    test('stream.emit was not called', () => {
                      assert.strictEqual(log.counts.emit, 0)
                    })
                  })
                })

                suite('read stream, push returns true:', () => {
                  setup(() => {
                    results.push[0] = true
                    log.args.JsonStream[0][0]()
                  })

                  test('stream.push was called twice', () => {
                    assert.strictEqual(log.counts.push, 3)
                  })

                  test('stream.push was called correctly first time', () => {
                    assert.strictEqual(log.args.push[1][0], ',"bar"')
                  })

                  test('stream.push was called correctly second time', () => {
                    assert.isNull(log.args.push[2][0])
                  })

                  test('stream.emit was not called', () => {
                    assert.strictEqual(log.counts.emit, 0)
                  })
                })
              })
            })
          })
        })

        suite('object event:', () => {
          setup(() => {
            log.args.JsonStream[0][0]()
            log.args.on[1][1]()
          })

          test('stream.push was called once', () => {
            assert.strictEqual(log.counts.push, 1)
          })

          test('stream.push was called correctly', () => {
            assert.strictEqual(log.args.push[0][0], '[{')
          })

          test('stream.emit was not called', () => {
            assert.strictEqual(log.counts.emit, 0)
          })
        })
      })
    })

    suite('streamify with space option:', () => {
      let data, options, result

      setup(() => {
        data = {}
        options = { space: 2 }
        result = streamify(data, options)
      })

      teardown(() => {
        data = options = result = undefined
      })

      test('JsonStream was called once', () => {
        assert.strictEqual(log.counts.JsonStream, 1)
      })

      test('eventify was called once', () => {
        assert.strictEqual(log.counts.eventify, 1)
      })

      test('EventEmitter.on was called ten times', () => {
        assert.strictEqual(log.counts.on, 10)
      })

      test('stream.push was not called', () => {
        assert.strictEqual(log.counts.push, 0)
      })

      suite('read stream, object event:', () => {
        setup(() => {
          log.args.JsonStream[0][0]()
          log.args.on[1][1]()
        })

        test('stream.push was called once', () => {
          assert.strictEqual(log.counts.push, 1)
        })

        test('stream.push was called correctly', () => {
          assert.strictEqual(log.args.push[0][0], '{')
        })

        suite('property event:', () => {
          setup(() => {
            log.args.on[2][1]('foo')
          })

          test('stream.push was called once', () => {
            assert.strictEqual(log.counts.push, 2)
          })

          test('stream.push was called correctly', () => {
            assert.strictEqual(log.args.push[1][0], '\n  "foo":')
          })

          suite('string event:', () => {
            setup(() => {
              log.args.on[3][1]('bar')
            })

            test('stream.push was called once', () => {
              assert.strictEqual(log.counts.push, 3)
            })

            test('stream.push was called correctly', () => {
              assert.strictEqual(log.args.push[2][0], ' "bar"')
            })

            suite('property event:', () => {
              setup(() => {
                log.args.on[2][1]('baz')
              })

              test('stream.push was called once', () => {
                assert.strictEqual(log.counts.push, 4)
              })

              test('stream.push was called correctly', () => {
                assert.strictEqual(log.args.push[3][0], ',\n  "baz":')
              })

              suite('string event:', () => {
                setup(() => {
                  log.args.on[3][1]('qux')
                })

                test('stream.push was called once', () => {
                  assert.strictEqual(log.counts.push, 5)
                })

                test('stream.push was called correctly', () => {
                  assert.strictEqual(log.args.push[4][0], ' "qux"')
                })

                suite('property event:', () => {
                  setup(() => {
                    log.args.on[2][1]('wibble')
                  })

                  test('stream.push was called once', () => {
                    assert.strictEqual(log.counts.push, 6)
                  })

                  test('stream.push was called correctly', () => {
                    assert.strictEqual(log.args.push[5][0], ',\n  "wibble":')
                  })

                  suite('array event:', () => {
                    setup(() => {
                      log.args.on[0][1]()
                    })

                    test('stream.push was called once', () => {
                      assert.strictEqual(log.counts.push, 7)
                    })

                    test('stream.push was called correctly', () => {
                      assert.strictEqual(log.args.push[6][0], ' [')
                    })

                    suite('string event:', () => {
                      setup(() => {
                        log.args.on[3][1]('0')
                      })

                      test('stream.push was called once', () => {
                        assert.strictEqual(log.counts.push, 8)
                      })

                      test('stream.push was called correctly', () => {
                        assert.strictEqual(log.args.push[7][0], '\n    "0"')
                      })

                      suite('string event:', () => {
                        setup(() => {
                          log.args.on[3][1]('1')
                        })

                        test('stream.push was called once', () => {
                          assert.strictEqual(log.counts.push, 9)
                        })

                        test('stream.push was called correctly', () => {
                          assert.strictEqual(log.args.push[8][0], ',\n    "1"')
                        })

                        suite('endArray event:', () => {
                          setup(() => {
                            log.args.on[6][1]()
                          })

                          test('stream.push was called once', () => {
                            assert.strictEqual(log.counts.push, 10)
                          })

                          test('stream.push was called correctly', () => {
                            assert.strictEqual(log.args.push[9][0], '\n  ]')
                          })

                          suite('property event:', () => {
                            setup(() => {
                              log.args.on[2][1]('a')
                            })

                            test('stream.push was called once', () => {
                              assert.strictEqual(log.counts.push, 11)
                            })

                            test('stream.push was called correctly', () => {
                              assert.strictEqual(log.args.push[10][0], ',\n  "a":')
                            })

                            suite('string event:', () => {
                              setup(() => {
                                log.args.on[3][1]('b')
                              })

                              test('stream.push was called once', () => {
                                assert.strictEqual(log.counts.push, 12)
                              })

                              test('stream.push was called correctly', () => {
                                assert.strictEqual(log.args.push[11][0], ' "b"')
                              })

                              suite('endObject event:', () => {
                                setup(() => {
                                  log.args.on[7][1]()
                                })

                                test('stream.push was called once', () => {
                                  assert.strictEqual(log.counts.push, 13)
                                })

                                test('stream.push was called correctly', () => {
                                  assert.strictEqual(log.args.push[12][0], '\n}')
                                })

                                test('stream.emit was not called', () => {
                                  assert.strictEqual(log.counts.emit, 0)
                                })
                              })
                            })
                          })
                        })
                      })
                    })
                  })
                })
              })
            })
          })
        })
      })

      suite('read stream, end event:', () => {
        setup(() => {
          log.args.JsonStream[0][0]()
          log.args.on[8][1]()
        })

        test('stream.push was called twice', () => {
          assert.strictEqual(log.counts.push, 2)
        })

        test('stream.push was called correctly first time', () => {
          assert.strictEqual(log.args.push[0][0], '')
        })

        test('stream.push was called correctly second time', () => {
          assert.isNull(log.args.push[1][0])
        })

        test('stream.emit was not called', () => {
          assert.strictEqual(log.counts.emit, 0)
        })
      })

      suite('error event:', () => {
        setup(() => {
          log.args.on[9][1]('foo')
        })

        test('stream.emit was called once', () => {
          assert.strictEqual(log.counts.emit, 1)
        })

        test('stream.emit was called correctly', () => {
          assert.lengthOf(log.args.emit[0], 2)
          assert.strictEqual(log.args.emit[0][0], 'dataError')
          assert.strictEqual(log.args.emit[0][1], 'foo')
        })
      })
    })
  })
})

