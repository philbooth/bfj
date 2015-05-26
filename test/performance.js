#!/usr/bin/env node

'use strict';

var fs, path, check, bfj, time, totalTime;

fs = require('fs');
path = require('path');
check = require('check-types');
bfj = require('../src');
time = (require('../src/time'))({ time: true });

console.log('parsing json');

totalTime = process.hrtime();

bfj.parse(
    fs.createReadStream(path.resolve(__dirname, process.argv[2] + '.json')),
    { time: true }
).then(function () {
    totalTime = process.hrtime(totalTime);
    console.log('parse succeeded');
    done(totalTime);
}).catch(function (error) {
    totalTime = process.hrtime(totalTime);
    console.log(error.stack);
    done(totalTime, 1);
});

function done (totalTime, code) {
    var report;

    console.log('%d seconds and %d nanoseconds', totalTime[0], totalTime[1]);

    report = time.report();
    write(process.argv[2] + '-timings.json', renderTimings(report.timings));
    write(process.argv[2] + '-sums.csv', renderSums(report.sums));

    process.exit(code);
}

function write (fileName, data) {
    fs.writeFileSync(
        path.resolve(__dirname, fileName),
        data,
        { mode: 420 }
    );
}

function renderTimings (timings) {
    return JSON.stringify(
        timings,
        function (key, value) {
            if (key === 'timing') {
                check.assert.array(value);
                check.assert.hasLength(value, 2);

                return { s: value[0], ns: value[1] };
            }

            return value;
        },
        '  '
    );
}

function renderSums (sums) {
    return 'Function,Count,Time\n' +
        Object.keys(sums).map(function (key) {
            var sum = sums[key];
            return key + ',' + sum.count + ',' + sum.total[0] + '.' + sum.total[1];
        }).join('\n');
}

