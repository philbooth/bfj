'use strict'

const check = require('check-types')
const BfjStream = require('./stream')
const util = require('util')

util.inherits(JsonStream, BfjStream)

module.exports = JsonStream

function JsonStream (read) {
  if (check.not.instanceStrict(this, JsonStream)) {
    return new JsonStream(read)
  }

  return BfjStream.call(this, read, { encoding: 'utf8' })
}
