/*globals module, setImmediate, setTimeout */

'use strict';

module.exports = {
    initialise: initialise
};

function initialise (options) {
    return {
        defer: defer,
        delay: delay.bind(null, options.delay || 1000)
    };
}

function defer (fn) {
    setImmediate(fn);
}

function delay (interval, fn) {
    setTimeout(fn, interval);
}

