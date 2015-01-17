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

function JsonError (actual, expected) {
    Error.call(
        this,
        'Encountered ' + actual +
        ' at line ' + line +
        ', column ' + column +
        ' where ' + expected.join(' or ') +
        ' was expected.'
    );
    this.actual = actual;
    this.expected = expected;
    this.lineNumber = line;
    this.columnNumber = column;
}
