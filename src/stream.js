/*globals require, module */

'use strict';

var util, Writable, check;

util = require('util');
Writable = require('stream').Writable;
check = require('check-types');

module.exports = JsonStream;

util.inherits(JsonStream, Writable);

function JsonStream (write) {
    check.assert.function(write, 'Invalid write implementation');

    if (check.not.instance(this, JsonStream)) {
        return new JsonStream(write);
    }

    this._write = function (chunk, encoding, callback) {
        write(chunk.toString());
        callback();
    };

    return Writable.call(this);
}

