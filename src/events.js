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
    end: 'end',
    error: 'err'
};

module.exports.endArray = modules.exports.endPrefix + modules.exports.array;
module.exports.endObject = modules.exports.endPrefix + modules.exports.object;

