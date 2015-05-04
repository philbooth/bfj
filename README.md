# BFJ

[![Build status][ci-image]][ci-status]

Big-friendly JSON. Asynchronous streaming functions for large JSON data sets.

* [Why would I want those?](#why-would-i-want-those)
* [What functions does it implement?](#what-functions-does-it-implement)
* [How do I install it?](#how-do-i-install-it)
* [How do I use it?](#how-do-i-use-it)
  * [bfj.walk (options)](#bfjwalk-options)
    * [Example](#example)
  * [bfj.parse (stream, options)](#bfjparse-stream-options)
    * [Example](#example-1)
  * [bfj.read (path, options)](#bfjread-path-options)
    * [Example](#example-2)
  * [bfj.eventify (data, options)](#bfjeventify-data-options)
    * [Example](#example-3)
  * [bfj.streamify (data, options)](#bfjstreamify-data-options)
    * [Example](#example-4)
  * [bfj.stringify (data, options)](#bfjstringify-data-options)
    * [Example](#example-5)
  * [bfj.write (path, data, options)](#bfjwrite-path-data-options)
    * [Example](#example-6)
* [Is there a change log?](#is-there-a-change-log)
* [How do I set up the dev environment?](#how-do-i-set-up-the-dev-environment)
* [What versions of node.js does it support?](#what-versions-of-nodejs-does-it-support)
* [What license is it released under?](#what-license-is-it-released-under)

## Why would I want those?

If you need
to parse
large JSON strings
or stringify
large JavaScript data sets,
it makes sense
to do so asynchronously
rather than
monopolising
the event loop.
BFJ implements
those asynchronous functions.

## What functions does it implement?

Seven functions
are exported.

Three are
concerned with
parsing, or
turning JSON strings
into JavaScript data:

* `walk`:
  Asynchronously walks
  a stream,
  emitting events
  as it encounters
  JSON tokens.
  Analagous to a
  [SAX parser][sax].

* `parse`:
  Asynchronously parses
  a stream of JSON.

* `read`:
  Asynchronously reads
  and parses
  a JSON file from disk.

The four remaining functions
handle the reverse transformations;
serialising
JavaScript data
to JSON:

* `eventify`:
  Asynchronously traverses
  a data structure,
  emitting events
  as it encounters items.
  Analagous to a
  SAX serialiser.

* `streamify`:
  Asynchronously serialises
  JSON to a stream.

* `stringify`:
  Asynchronously serialises
  a JSON string.

* `write`:
  Asynchronously writes
  a JSON file to disk.

## How do I install it?

If you're using npm:

```
npm install bfj --save
```

Or if you just want
the git repo:

```
git clone git@github.com:philbooth/bfj.git
```

## How do I use it?

Import the library
using `require`:

```js
var bfj = require('bfj');
```

Seven functions
are exported:
`walk`,
`parse`,
`read`,
`eventify`,
`streamify`,
`stringify` and
`write`.

### bfj.walk (options)

`walk` initialises and returns
an asynchronous walker object
`{ stream, emitter }`,
where `stream`
is a [Writable] instance
that receives JSON
and `emitter`
is an [EventEmitter] instance
that emits events
when JSON tokens
are encountered.

The events
are defined
in a public property,
`events`:

* `bfj.events.array`:
  Indicates that
  an array context
  has been entered
  by encountering
  the `[` character.

* `bfj.events.endArray`:
  Indicates that
  an array context
  has been left
  by encountering
  the `]` character.

* `bfj.events.object`:
  Indicates that
  an object context
  has been entered
  by encountering
  the `{` character.

* `bfj.events.endObject`:
  Indicates that
  an object context
  has been left
  by encountering
  the `}` character.

* `bfj.events.property`:
  Indicates that
  a property
  has been encountered
  in an object.
  The listener
  will be passed
  the name of the property
  and the next event
  to be emitted
  will represent
  the property's value.

* `bfj.events.string`:
  Indicates that
  a string
  has been encountered.
  The listener
  will be passed
  the string.

* `bfj.events.number`:
  Indicates that
  a number
  has been encountered.
  The listener
  will be passed
  the number.

* `bfj.events.literal`:
  Indicates that
  a literal
  (either `true`, `false` or `null`)
  has been encountered.
  The listener
  will be passed
  the literal.

* `bfj.events.end`:
  Indicates that
  the end of the input
  has been reached
  and the stream is closed.

* `bfj.events.error`:
  Indicates that
  a syntax error
  has occurred.
  The listener
  will be passed
  the `Error` instance.

`walk` takes
one argument,
an options object
that supports
the following properties:

* `options.discard`:
  The number of characters
  to process before
  discarding them
  to save memory.
  The default value
  is `16384`.

* `options.debug`:
  Log debug messages
  to the console.

#### Example

```js
var walker = bfj.walk();

fs.createReadStream(path).pipe(walker.stream);

walker.emitter.on(bfj.events.array, array);
walker.emitter.on(bfj.events.object, object);
walker.emitter.on(bfj.events.property, property);
walker.emitter.on(bfj.events.string, value);
walker.emitter.on(bfj.events.number, value);
walker.emitter.on(bfj.events.literal, value);
walker.emitter.on(bfj.events.endArray, endScope);
walker.emitter.on(bfj.events.endObject, endScope);
walker.emitter.on(bfj.events.end, end);
walker.emitter.on(bfj.events.error, error);
```

### bfj.parse (stream, options)

`parse` asynchronously parses
JSON from
a [Readable] instance
and returns a promise.
If there are
no syntax errors,
the promise is resolved
with the parsed data.
If syntax errors occur,
the promise is rejected
with the first error.

#### Example

```js
bfj.parse(fs.createReadStream(path))
    .then(function (data) {
        // :)
    })
    .catch(function (error) {
        // :(
    });
```

### bfj.read (path, options)

`read` asynchronously parses
a JSON file and
returns a promise.
If there are
no syntax errors,
the promise is resolved
with the parsed data.
If syntax errors occur,
the promise is rejected
with the first error.

#### Example

```js
bfj.read(path)
    .then(function (data) {
        // :)
    })
    .catch(function (error) {
        // :(
    });
```

### bfj.eventify (data, options)

`eventify` returns an EventEmitter
and asynchronously performs
depth-first traversal,
emitting events as it
encounters data.
By default
it coerces
promises,
buffers,
dates,
maps and
other iterables
to JSON-friendly values.

The emitted events
are defined
in a public property,
`events`:

* `bfj.events.array`:
  Indicates that
  an array
  has been encountered.

* `bfj.events.endArray`:
  Indicates that
  the end of an array
  has been encountered.

* `bfj.events.object`:
  Indicates that
  an object
  has been encountered.

* `bfj.events.endObject`:
  Indicates that
  the end of an object
  has been encountered.

* `bfj.events.property`:
  Indicates that
  a property
  has been encountered
  in an object.
  The listener
  will be passed
  the name of the property
  and the next event
  to be emitted
  will represent
  the property's value.

* `bfj.events.string`:
  Indicates that
  a string
  has been encountered.
  The listener
  will be passed
  the string.

* `bfj.events.number`:
  Indicates that
  a number
  has been encountered.
  The listener
  will be passed
  the number.

* `bfj.events.literal`:
  Indicates that
  a literal
  (either `true`, `false` or `null`)
  has been encountered.
  The listener
  will be passed
  the literal.

* `bfj.events.end`:
  Indicates that
  the end of the input
  has been reached and
  no further events
  will be emitted.

`eventify` takes
two arguments,
the data to traverse and
an options object
that supports
the following properties:

* `options.promises`:
  By default,
  promises are coerced
  to their resolved value.
  Set this property
  to `ignore`
  if you'd prefer
  to ignore promises
  in the data.

* `options.buffers`:
  By default,
  buffers are coerced
  using their `toString` method.
  Set this property
  to `ignore`
  if you'd prefer
  to ignore buffers
  in the data.

* `options.dates`:
  By default,
  dates are coerced
  using their `toJSON` method.
  Set this property
  to `ignore`
  if you'd prefer
  to ignore dates
  in the data.

* `options.maps`:
  By default,
  maps are coerced
  to plain objects.
  Set this property
  to `ignore`
  if you'd prefer
  to ignore maps
  in the data.

* `options.iterables`:
  By default,
  other iterables
  (i.e. not arrays, strings or maps)
  are coerced
  to arrays.
  Set this property
  to `ignore`
  if you'd prefer
  to ignore other iterables
  in the data.

* `options.debug`:
  Log debug messages
  to the console.

#### Example

```js
var emitter = bfj.eventify(data);

emitter.on(bfj.events.array, array);
emitter.on(bfj.events.object, object);
emitter.on(bfj.events.property, property);
emitter.on(bfj.events.string, string);
emitter.on(bfj.events.number, value);
emitter.on(bfj.events.literal, value);
emitter.on(bfj.events.endArray, endArray);
emitter.on(bfj.events.endObject, endObject);
emitter.on(bfj.events.end, end);
```

### bfj.streamify (data, options)

`streamify` asynchronously serialises data
to a JSON stream,
returning a `Readable` instance.

#### Example

```js
var stream = bfj.streamify(data);

stream.on('data', read);
stream.on('end', end);
```

### bfj.stringify (data, options)

`stringify` asynchronously serialises data
to a JSON string,
returning a promise
that is resolved
when serialisation is complete.

#### Example

```js
bfj.stringify(data)
    .then(function (json) {
	    // :)
	});
```

### bfj.write (path, data, options)

`write` asynchronously serialises data
to a JSON file on disk,
returning the target file stream.

#### Example

```js
bfj.write(path, data)
    .on('finish', function () {
	    // :)
	});
```

## Is there a change log?

[Yes][history].

## How do I set up the dev environment?

The development environment
relies on node.js,
[JSHint],
[Mocha],
[Chai],
[Mockery] and
[Spooks].
Assuming that
you already have
node and NPM
set up,
you just need
to run
`npm install`
to install
all of the dependencies
as listed in `package.json`.

You can
lint the code
with the command
`npm run lint`.

You can
run the tests
with the command
`npm test`.

## What versions of node.js does it support?

0.12 and the latest stable io.js.

## What license is it released under?

[MIT][license].

[ci-image]: https://secure.travis-ci.org/philbooth/bfj.png?branch=master
[ci-status]: http://travis-ci.org/#!/philbooth/bfj
[sax]: http://en.wikipedia.org/wiki/Simple_API_for_XML
[writable]: https://nodejs.org/api/stream.html#stream_class_stream_writable
[eventemitter]: https://nodejs.org/api/events.html#events_class_events_eventemitter
[readable]: https://nodejs.org/api/stream.html#stream_class_stream_readable
[history]: HISTORY.md
[jshint]: https://github.com/jshint/node-jshint
[mocha]: https://github.com/mochajs/mocha
[chai]: https://github.com/chaijs
[mockery]: https://github.com/mfncooper/mockery
[spooks]: https://github.com/philbooth/spooks.js
[license]: COPYING

