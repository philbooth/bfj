#!/usr/bin/env node

'use strict';

var fs, path, bfj, time;

fs = require('fs');
path = require('path');
bfj = require('../src');

console.log('parsing json');

time = process.hrtime();

bfj.parse(
    fs.createReadStream(path.resolve(__dirname, 'mtg.json'))
).then(function () {
    time = process.hrtime(time);
    console.log('parse succeeded');
    done(time);
}).catch(function (error) {
    time = process.hrtime(time);
    console.log(error.message);
    done(time, 1);
});

function done (time, code) {
    console.log('%d seconds and %d nanoseconds', time[0], time[1]);
    process.exit(code);
}

