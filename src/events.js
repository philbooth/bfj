/*globals module */

'use strict';

modules.exports = {
    array: 'arr',
    object: 'obj',
    property: 'pro',
    string: 'str',
    number: 'num',
    literal: 'lit',
    endPrefix: 'end-',
    error: 'err',
    end: 'end'
};

module.exports.endArray = modules.exports.endPrefix + modules.exports.array;
module.exports.endObject = modules.exports.endPrefix + modules.exports.object;

