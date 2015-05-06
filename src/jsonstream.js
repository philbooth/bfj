/*globals require, module */

'use strict';

var util, Readable, check;

util = require('util');
Readable = require('stream').Readable;
check = require('check-types');

util.inherits(JsonStream, Readable);

module.exports = JsonStream;

function JsonStream (read) {
    if (check.not.instance(this, JsonStream)) {
        return new JsonStream(read);
    }

    check.assert.function(read, 'Invalid read implementation');

    this._read = function (/*size*/) {
        read();
    };

    return Readable.call(this, { encoding: 'utf8' });
}

