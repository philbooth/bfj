#!/usr/bin/env node

'use strict';

var http, Readable, info, bfj;

http = require('http');
Readable = require('stream').Readable;
info = require('../package.json');
bfj = require('../src');

console.log('requesting json');

http.get({
    host: 'mtgjson.com',
    path: '/json/AllSets-x.json',
    headers: {
        'User-Agent': getUserAgent()
    }
}, receive);

function getUserAgent () {
    return nv(info.name, info.version) + ' (' + nv(process.title, process.version) + ')';
}

function nv (name, version) {
    return name + '/' + version;
}

function receive (response) {
    var data, stream, isEnded;

    console.log('received %d response', response.statusCode);

    data = '';

    if (response.statusCode === 200) {
        stream = new Readable();
        stream._read = read;
        response.on('data', chunk);
        response.on('end', end);
        parse(stream);
    }

    function read () {
        if (isEnded && data === '') {
            data = null;
        }

        stream.push(data);
        data = '';
    }

    function chunk (d) {
        data += d;
    }

    function end () {
        isEnded = true;
    }
}

function parse (stream) {
    var time;

    console.log('parsing json');

    time = process.hrtime();

    bfj.parse(stream, { debug: true }).then(function () {
        time = process.hrtime(time);
        console.log('parse succeeded');
        done(time);
    }).catch(function (error) {
        time = process.hrtime(time);
        console.log(error.message);
        done(time, 1);
    });
}

function done (time, code) {
    console.log('%d seconds and %d nanoseconds', time[0], time[1]);
    process.exit(code);
}

