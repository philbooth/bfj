#!/usr/bin/env node

'use strict';

var fs, path, check, bfj, time;

fs = require('fs');
path = require('path');
check = require('check-types');
bfj = require('../src');

console.log('reading json');

time = process.hrtime();

bfj.read(getDataPath('.json')).
    then(function (data) {
        var options;
        reportTime();
        if (process.argv[2] === 'wpt') {
            options = { space: 2 };
        }
        console.log('writing json');
        return bfj.write(getDataPath('-result.json'), data, options);
    }).
    then(function () {
        done('succeeded');
    }).
    catch(function (error) {
        done(error.stack, 1);
    });

function getDataPath (suffix) {
    return path.resolve(__dirname, process.argv[2] + suffix);
}

function reportTime () {
    var interimTime = process.hrtime(time);
    console.log('%d seconds and %d nanoseconds', interimTime[0], interimTime[1]);
    time = process.hrtime();
}

function done (message, code) {
    reportTime();
    console.log(message);
    process.exit(code);
}

