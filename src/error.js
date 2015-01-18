/*globals module */

'use strict';

module.exports = JsonError;
JsonError.prototype =
    Object.create(Error, {
        constructor: {
            value: Error,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });

function JsonError (actual, expected, line, column) {
    Error.call(
        this,
        'JSON error: encountered ' + actual +
        ' at line ' + line +
        ', column ' + column +
        ' where ' + expected +
        ' was expected.'
    );
    this.actual = actual;
    this.expected = expected;
    this.lineNumber = line;
    this.columnNumber = column;
}
