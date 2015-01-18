/*globals module */

'use strict';

module.exports = {
    create: create
};

function create (actual, expected, line, column) {
    var error;

    error = new Error(
        'JSON error: encountered `' + actual +
        '` at line ' + line +
        ', column ' + column +
        ' where `' + expected +
        '` was expected.'
    );

    error.actual = actual;
    error.expected = expected;
    error.lineNumber = line;
    error.columnNumber = column;

    return error;
}

