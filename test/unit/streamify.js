'use strict'

const assert = require('chai').assert
const mockery = require('mockery')
const spooks = require('spooks')

const modulePath = '../../src/streamify'

mockery.registerAllowable(modulePath)
mockery.registerAllowable('hoopy')
mockery.registerAllowable('check-types')
mockery.registerAllowable('./events')

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

            test('stream.push was called six times', () => {
              assert.strictEqual(log.counts.push, 6)
            })

            test('stream.push was called correctly', () => {
              assert.strictEqual(log.args.push[0][0], '[')
              assert.strictEqual(log.args.push[1][0], '"')
              assert.strictEqual(log.args.push[2][0], 'f')
              assert.strictEqual(log.args.push[3][0], 'o')
              assert.strictEqual(log.args.push[4][0], 'o')
              assert.strictEqual(log.args.push[5][0], '"')
            })

            suite('string event:', () => {
              setup(() => {
                log.args.on[3][1]('bar')
              })

              test('stream.push was called six times', () => {
                assert.strictEqual(log.counts.push, 12)
              })

              test('stream.push was called correctly', () => {
                assert.strictEqual(log.args.push[6][0], ',')
                assert.strictEqual(log.args.push[7][0], '"')
                assert.strictEqual(log.args.push[8][0], 'b')
                assert.strictEqual(log.args.push[9][0], 'a')
                assert.strictEqual(log.args.push[10][0], 'r')
                assert.strictEqual(log.args.push[11][0], '"')
              })
            })

            suite('array event:', () => {
              setup(() => {
                log.args.on[0][1]()
              })

              test('stream.push was called twice', () => {
                assert.strictEqual(log.counts.push, 8)
              })

              test('stream.push was called correctly', () => {
                assert.strictEqual(log.args.push[6][0], ',')
                assert.strictEqual(log.args.push[7][0], '[')
              })

              suite('array event:', () => {
                setup(() => {
                  log.args.on[0][1]()
                })

                test('stream.push was called once', () => {
                  assert.strictEqual(log.counts.push, 9)
                })

                test('stream.push was called correctly', () => {
                  assert.strictEqual(log.args.push[8][0], '[')
                })

                suite('endArray event:', () => {
                  setup(() => {
                    log.args.on[6][1]()
                  })

                  test('stream.push was called once', () => {
                    assert.strictEqual(log.counts.push, 10)
                  })

                  test('stream.push was called correctly', () => {
                    assert.strictEqual(log.args.push[9][0], ']')
                  })

                  suite('string event:', () => {
                    setup(() => {
                      log.args.on[3][1]('bar')
                    })

                    test('stream.push was called six times', () => {
                      assert.strictEqual(log.counts.push, 16)
                    })

                    test('stream.push was called correctly', () => {
                      assert.strictEqual(log.args.push[10][0], ',')
                      assert.strictEqual(log.args.push[11][0], '"')
                      assert.strictEqual(log.args.push[12][0], 'b')
                      assert.strictEqual(log.args.push[13][0], 'a')
                      assert.strictEqual(log.args.push[14][0], 'r')
                      assert.strictEqual(log.args.push[15][0], '"')
                    })

                    suite('string event:', () => {
                      setup(() => {
                        log.args.on[3][1]('baz')
                      })

                      test('stream.push was called six times', () => {
                        assert.strictEqual(log.counts.push, 22)
                      })

                      test('stream.push was called correctly', () => {
                        assert.strictEqual(log.args.push[16][0], ',')
                        assert.strictEqual(log.args.push[17][0], '"')
                        assert.strictEqual(log.args.push[18][0], 'b')
                        assert.strictEqual(log.args.push[19][0], 'a')
                        assert.strictEqual(log.args.push[20][0], 'z')
                        assert.strictEqual(log.args.push[21][0], '"')
                      })
                    })

                    suite('endArray event:', () => {
                      setup(() => {
                        log.args.on[6][1]()
                      })

                      test('stream.push was called once', () => {
                        assert.strictEqual(log.counts.push, 17)
                      })

                      test('stream.push was called correctly', () => {
                        assert.strictEqual(log.args.push[16][0], ']')
                      })

                      suite('string event:', () => {
                        setup(() => {
                          log.args.on[3][1]('baz')
                        })

                        test('stream.push was called six times', () => {
                          assert.strictEqual(log.counts.push, 23)
                        })

                        test('stream.push was called correctly', () => {
                          assert.strictEqual(log.args.push[17][0], ',')
                          assert.strictEqual(log.args.push[18][0], '"')
                          assert.strictEqual(log.args.push[19][0], 'b')
                          assert.strictEqual(log.args.push[20][0], 'a')
                          assert.strictEqual(log.args.push[21][0], 'z')
                          assert.strictEqual(log.args.push[22][0], '"')
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

              test('stream.push was called twice', () => {
                assert.strictEqual(log.counts.push, 8)
              })

              test('stream.push was called correctly', () => {
                assert.strictEqual(log.args.push[6][0], ',')
                assert.strictEqual(log.args.push[7][0], '{')
              })

              suite('property event:', () => {
                setup(() => {
                  log.args.on[2][1]('bar')
                })

                test('stream.push was called six times', () => {
                  assert.strictEqual(log.counts.push, 14)
                })

                test('stream.push was called correctly', () => {
                  assert.strictEqual(log.args.push[8][0], '"')
                  assert.strictEqual(log.args.push[9][0], 'b')
                  assert.strictEqual(log.args.push[10][0], 'a')
                  assert.strictEqual(log.args.push[11][0], 'r')
                  assert.strictEqual(log.args.push[12][0], '"')
                  assert.strictEqual(log.args.push[13][0], ':')
                })

                suite('string event:', () => {
                  setup(() => {
                    log.args.on[3][1]('baz')
                  })

                  test('stream.push was called five times', () => {
                    assert.strictEqual(log.counts.push, 19)
                  })

                  test('stream.push was called correctly', () => {
                    assert.strictEqual(log.args.push[14][0], '"')
                    assert.strictEqual(log.args.push[15][0], 'b')
                    assert.strictEqual(log.args.push[16][0], 'a')
                    assert.strictEqual(log.args.push[17][0], 'z')
                    assert.strictEqual(log.args.push[18][0], '"')
                  })

                  suite('property event:', () => {
                    setup(() => {
                      log.args.on[2][1]('nested')
                    })

                    test('stream.push was called ten times', () => {
                      assert.strictEqual(log.counts.push, 29)
                    })

                    test('stream.push was called correctly', () => {
                      assert.strictEqual(log.args.push[19][0], ',')
                      assert.strictEqual(log.args.push[20][0], '"')
                      assert.strictEqual(log.args.push[21][0], 'n')
                      assert.strictEqual(log.args.push[22][0], 'e')
                      assert.strictEqual(log.args.push[23][0], 's')
                      assert.strictEqual(log.args.push[24][0], 't')
                      assert.strictEqual(log.args.push[25][0], 'e')
                      assert.strictEqual(log.args.push[26][0], 'd')
                      assert.strictEqual(log.args.push[27][0], '"')
                      assert.strictEqual(log.args.push[28][0], ':')
                    })

                    suite('object event:', () => {
                      setup(() => {
                        log.args.on[1][1]()
                      })

                      test('stream.push was called once', () => {
                        assert.strictEqual(log.counts.push, 30)
                      })

                      test('stream.push was called correctly', () => {
                        assert.strictEqual(log.args.push[29][0], '{')
                      })

                      suite('endObject event:', () => {
                        setup(() => {
                          log.args.on[7][1]()
                        })

                        test('stream.push was called once', () => {
                          assert.strictEqual(log.counts.push, 31)
                        })

                        test('stream.push was called correctly', () => {
                          assert.strictEqual(log.args.push[30][0], '}')
                        })

                        suite('property event:', () => {
                          setup(() => {
                            log.args.on[2][1]('qux')
                          })

                          test('stream.push was called seven times', () => {
                            assert.strictEqual(log.counts.push, 38)
                          })

                          test('stream.push was called correctly', () => {
                            assert.strictEqual(log.args.push[31][0], ',')
                            assert.strictEqual(log.args.push[32][0], '"')
                            assert.strictEqual(log.args.push[33][0], 'q')
                            assert.strictEqual(log.args.push[34][0], 'u')
                            assert.strictEqual(log.args.push[35][0], 'x')
                            assert.strictEqual(log.args.push[36][0], '"')
                            assert.strictEqual(log.args.push[37][0], ':')
                          })

                          suite('string event:', () => {
                            setup(() => {
                              log.args.on[3][1]('wibble')
                            })

                            test('stream.push was called eight times', () => {
                              assert.strictEqual(log.counts.push, 46)
                            })

                            test('stream.push was called correctly', () => {
                              assert.strictEqual(log.args.push[38][0], '"')
                              assert.strictEqual(log.args.push[39][0], 'w')
                              assert.strictEqual(log.args.push[40][0], 'i')
                              assert.strictEqual(log.args.push[41][0], 'b')
                              assert.strictEqual(log.args.push[42][0], 'b')
                              assert.strictEqual(log.args.push[43][0], 'l')
                              assert.strictEqual(log.args.push[44][0], 'e')
                              assert.strictEqual(log.args.push[45][0], '"')
                            })
                          })
                        })

                        suite('endObject event:', () => {
                          setup(() => {
                            log.args.on[7][1]()
                          })

                          test('stream.push was called once', () => {
                            assert.strictEqual(log.counts.push, 32)
                          })

                          test('stream.push was called correctly', () => {
                            assert.strictEqual(log.args.push[31][0], '}')
                          })

                          suite('string event:', () => {
                            setup(() => {
                              log.args.on[3][1]('wibble')
                            })

                            test('stream.push was called nine times', () => {
                              assert.strictEqual(log.counts.push, 41)
                            })

                            test('stream.push was called correctly', () => {
                              assert.strictEqual(log.args.push[32][0], ',')
                              assert.strictEqual(log.args.push[33][0], '"')
                              assert.strictEqual(log.args.push[34][0], 'w')
                              assert.strictEqual(log.args.push[35][0], 'i')
                              assert.strictEqual(log.args.push[36][0], 'b')
                              assert.strictEqual(log.args.push[37][0], 'b')
                              assert.strictEqual(log.args.push[38][0], 'l')
                              assert.strictEqual(log.args.push[39][0], 'e')
                              assert.strictEqual(log.args.push[40][0], '"')
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
              assert.strictEqual(log.args.push[0][0], '[')
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
                  results.push[0] = true
                  log.args.JsonStream[0][0]()
                  log.args.on[6][1]()
                })

                test('stream.push was called twelve times', () => {
                  assert.strictEqual(log.counts.push, 13)
                })

                test('stream.push was called correctly', () => {
                  assert.strictEqual(log.args.push[1][0], '"')
                  assert.strictEqual(log.args.push[2][0], 'f')
                  assert.strictEqual(log.args.push[3][0], 'o')
                  assert.strictEqual(log.args.push[4][0], 'o')
                  assert.strictEqual(log.args.push[5][0], '"')
                  assert.strictEqual(log.args.push[6][0], ',')
                  assert.strictEqual(log.args.push[7][0], '"')
                  assert.strictEqual(log.args.push[8][0], 'b')
                  assert.strictEqual(log.args.push[9][0], 'a')
                  assert.strictEqual(log.args.push[10][0], 'r')
                  assert.strictEqual(log.args.push[11][0], '"')
                  assert.strictEqual(log.args.push[12][0], ']')
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

                suite('read stream, push returns true:', () => {
                  setup(() => {
                    results.push[0] = true
                    log.args.JsonStream[0][0]()
                  })

                  test('stream.push was called twelve times', () => {
                    assert.strictEqual(log.counts.push, 13)
                  })

                  test('stream.push was called correctly', () => {
                    assert.strictEqual(log.args.push[1][0], '"')
                    assert.strictEqual(log.args.push[2][0], 'f')
                    assert.strictEqual(log.args.push[3][0], 'o')
                    assert.strictEqual(log.args.push[4][0], 'o')
                    assert.strictEqual(log.args.push[5][0], '"')
                    assert.strictEqual(log.args.push[6][0], ',')
                    assert.strictEqual(log.args.push[7][0], '"')
                    assert.strictEqual(log.args.push[8][0], 'b')
                    assert.strictEqual(log.args.push[9][0], 'a')
                    assert.strictEqual(log.args.push[10][0], 'r')
                    assert.strictEqual(log.args.push[11][0], '"')
                    assert.isNull(log.args.push[12][0])
                  })

                  suite('read stream:', () => {
                    setup(() => {
                      log.args.JsonStream[0][0]()
                    })

                    test('stream.push was not called', () => {
                      assert.strictEqual(log.counts.push, 13)
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
            log.args.JsonStream[0][0]()
            log.args.on[1][1]()
          })

          test('stream.push was called twice', () => {
            assert.strictEqual(log.counts.push, 2)
          })

          test('stream.push was called correctly', () => {
            assert.strictEqual(log.args.push[0][0], '[')
            assert.strictEqual(log.args.push[1][0], '{')
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

          test('stream.push was called nine times', () => {
            assert.strictEqual(log.counts.push, 10)
          })

          test('stream.push was called correctly', () => {
            assert.strictEqual(log.args.push[1][0], '\n')
            assert.strictEqual(log.args.push[2][0], ' ')
            assert.strictEqual(log.args.push[3][0], ' ')
            assert.strictEqual(log.args.push[4][0], '"')
            assert.strictEqual(log.args.push[5][0], 'f')
            assert.strictEqual(log.args.push[6][0], 'o')
            assert.strictEqual(log.args.push[7][0], 'o')
            assert.strictEqual(log.args.push[8][0], '"')
            assert.strictEqual(log.args.push[9][0], ':')
          })

          suite('string event:', () => {
            setup(() => {
              log.args.on[3][1]('bar')
            })

            test('stream.push was called six times', () => {
              assert.strictEqual(log.counts.push, 16)
            })

            test('stream.push was called correctly', () => {
              assert.strictEqual(log.args.push[10][0], ' ')
              assert.strictEqual(log.args.push[11][0], '"')
              assert.strictEqual(log.args.push[12][0], 'b')
              assert.strictEqual(log.args.push[13][0], 'a')
              assert.strictEqual(log.args.push[14][0], 'r')
              assert.strictEqual(log.args.push[15][0], '"')
            })

            suite('property event:', () => {
              setup(() => {
                log.args.on[2][1]('baz')
              })

              test('stream.push was called ten times', () => {
                assert.strictEqual(log.counts.push, 26)
              })

              test('stream.push was called correctly', () => {
                assert.strictEqual(log.args.push[16][0], ',')
                assert.strictEqual(log.args.push[17][0], '\n')
                assert.strictEqual(log.args.push[18][0], ' ')
                assert.strictEqual(log.args.push[19][0], ' ')
                assert.strictEqual(log.args.push[20][0], '"')
                assert.strictEqual(log.args.push[21][0], 'b')
                assert.strictEqual(log.args.push[22][0], 'a')
                assert.strictEqual(log.args.push[23][0], 'z')
                assert.strictEqual(log.args.push[24][0], '"')
                assert.strictEqual(log.args.push[25][0], ':')
              })

              suite('string event:', () => {
                setup(() => {
                  log.args.on[3][1]('qux')
                })

                test('stream.push was called six times', () => {
                  assert.strictEqual(log.counts.push, 32)
                })

                test('stream.push was called correctly', () => {
                  assert.strictEqual(log.args.push[26][0], ' ')
                  assert.strictEqual(log.args.push[27][0], '"')
                  assert.strictEqual(log.args.push[28][0], 'q')
                  assert.strictEqual(log.args.push[29][0], 'u')
                  assert.strictEqual(log.args.push[30][0], 'x')
                  assert.strictEqual(log.args.push[31][0], '"')
                })

                suite('property event:', () => {
                  setup(() => {
                    log.args.on[2][1]('wibble')
                  })

                  test('stream.push was called thirteen times', () => {
                    assert.strictEqual(log.counts.push, 45)
                  })

                  test('stream.push was called correctly', () => {
                    assert.strictEqual(log.args.push[32][0], ',')
                    assert.strictEqual(log.args.push[33][0], '\n')
                    assert.strictEqual(log.args.push[34][0], ' ')
                    assert.strictEqual(log.args.push[35][0], ' ')
                    assert.strictEqual(log.args.push[36][0], '"')
                    assert.strictEqual(log.args.push[37][0], 'w')
                    assert.strictEqual(log.args.push[38][0], 'i')
                    assert.strictEqual(log.args.push[39][0], 'b')
                    assert.strictEqual(log.args.push[40][0], 'b')
                    assert.strictEqual(log.args.push[41][0], 'l')
                    assert.strictEqual(log.args.push[42][0], 'e')
                    assert.strictEqual(log.args.push[43][0], '"')
                    assert.strictEqual(log.args.push[44][0], ':')
                  })

                  suite('array event:', () => {
                    setup(() => {
                      log.args.on[0][1]()
                    })

                    test('stream.push was called twice', () => {
                      assert.strictEqual(log.counts.push, 47)
                    })

                    test('stream.push was called correctly', () => {
                      assert.strictEqual(log.args.push[45][0], ' ')
                      assert.strictEqual(log.args.push[46][0], '[')
                    })

                    suite('string event:', () => {
                      setup(() => {
                        log.args.on[3][1]('0')
                      })

                      test('stream.push was called eight times', () => {
                        assert.strictEqual(log.counts.push, 55)
                      })

                      test('stream.push was called correctly', () => {
                        assert.strictEqual(log.args.push[47][0], '\n')
                        assert.strictEqual(log.args.push[48][0], ' ')
                        assert.strictEqual(log.args.push[49][0], ' ')
                        assert.strictEqual(log.args.push[50][0], ' ')
                        assert.strictEqual(log.args.push[51][0], ' ')
                        assert.strictEqual(log.args.push[52][0], '"')
                        assert.strictEqual(log.args.push[53][0], '0')
                        assert.strictEqual(log.args.push[54][0], '"')
                      })

                      suite('string event:', () => {
                        setup(() => {
                          log.args.on[3][1]('1')
                        })

                        test('stream.push was called nine times', () => {
                          assert.strictEqual(log.counts.push, 64)
                        })

                        test('stream.push was called correctly', () => {
                          assert.strictEqual(log.args.push[55][0], ',')
                          assert.strictEqual(log.args.push[56][0], '\n')
                          assert.strictEqual(log.args.push[57][0], ' ')
                          assert.strictEqual(log.args.push[58][0], ' ')
                          assert.strictEqual(log.args.push[59][0], ' ')
                          assert.strictEqual(log.args.push[60][0], ' ')
                          assert.strictEqual(log.args.push[61][0], '"')
                          assert.strictEqual(log.args.push[62][0], '1')
                          assert.strictEqual(log.args.push[63][0], '"')
                        })

                        suite('endArray event:', () => {
                          setup(() => {
                            log.args.on[6][1]()
                          })

                          test('stream.push was called four times', () => {
                            assert.strictEqual(log.counts.push, 68)
                          })

                          test('stream.push was called correctly', () => {
                            assert.strictEqual(log.args.push[64][0], '\n')
                            assert.strictEqual(log.args.push[65][0], ' ')
                            assert.strictEqual(log.args.push[66][0], ' ')
                            assert.strictEqual(log.args.push[67][0], ']')
                          })

                          suite('property event:', () => {
                            setup(() => {
                              log.args.on[2][1]('a')
                            })

                            test('stream.push was called eight times', () => {
                              assert.strictEqual(log.counts.push, 76)
                            })

                            test('stream.push was called correctly', () => {
                              assert.strictEqual(log.args.push[68][0], ',')
                              assert.strictEqual(log.args.push[69][0], '\n')
                              assert.strictEqual(log.args.push[70][0], ' ')
                              assert.strictEqual(log.args.push[71][0], ' ')
                              assert.strictEqual(log.args.push[72][0], '"')
                              assert.strictEqual(log.args.push[73][0], 'a')
                              assert.strictEqual(log.args.push[74][0], '"')
                              assert.strictEqual(log.args.push[75][0], ':')
                            })

                            suite('string event:', () => {
                              setup(() => {
                                log.args.on[3][1]('b')
                              })

                              test('stream.push was called four times', () => {
                                assert.strictEqual(log.counts.push, 80)
                              })

                              test('stream.push was called correctly', () => {
                                assert.strictEqual(log.args.push[76][0], ' ')
                                assert.strictEqual(log.args.push[77][0], '"')
                                assert.strictEqual(log.args.push[78][0], 'b')
                                assert.strictEqual(log.args.push[79][0], '"')
                              })

                              suite('endObject event:', () => {
                                setup(() => {
                                  log.args.on[7][1]()
                                })

                                test('stream.push was called twice', () => {
                                  assert.strictEqual(log.counts.push, 82)
                                })

                                test('stream.push was called correctly', () => {
                                  assert.strictEqual(log.args.push[80][0], '\n')
                                  assert.strictEqual(log.args.push[81][0], '}')
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

        test('stream.push was called once', () => {
          assert.strictEqual(log.counts.push, 1)
        })

        test('stream.push was called correctly', () => {
          assert.isNull(log.args.push[0][0])
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

