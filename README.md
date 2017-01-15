# BFJ

[![Package status](https://img.shields.io/npm/v/bfj.svg?style=flat-square)](https://www.npmjs.com/package/bfj)
[![Build status](https://img.shields.io/travis/philbooth/bfj.svg?style=flat-square)](https://travis-ci.org/philbooth/bfj)
[![License](https://img.shields.io/github/license/philbooth/bfj.svg?style=flat-square)](https://opensource.org/licenses/MIT)

Big-Friendly JSON. Asynchronous streaming functions for large JSON data sets.

* [Why would I want those?](#why-would-i-want-those)
* [What functions does it implement?](#what-functions-does-it-implement)
* [How do I install it?](#how-do-i-install-it)
* [How do I read a JSON file?](#how-do-i-read-a-json-file)
* [How do I write a JSON file?](#how-do-i-write-a-json-file)
* [How do I parse a stream of JSON?](#how-do-i-parse-a-stream-of-json)
* [How do I create a JSON string?](#how-do-i-create-a-json-string)
* [How do I create a stream of JSON?](#how-do-i-create-a-stream-of-json)
* [What other methods are there?](#what-other-methods-are-there)
  * [bfj.walk (stream, options)](#bfjwalk-stream-options)
  * [bfj.eventify (data, options)](#bfjeventify-data-options)
* [What options can I specify?](#what-options-can-i-specify)
  * [Options for parsing functions](#options-for-parsing-functions)
  * [Options for serialisation functions](#options-for-serialisation-functions)
* [Is there a change log?](#is-there-a-change-log)
* [How do I set up the dev environment?](#how-do-i-set-up-the-dev-environment)
* [What versions of Node.js does it support?](#what-versions-of-nodejs-does-it-support)
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

* [`read`](#how-do-i-read-a-json-file)
  asynchronously parses
  a JSON file from disk.

* [`parse`](#how-do-i-parse-a-stream-of-json)
  asynchronously parses
  a stream of JSON.

* [`walk`](#bfjwalk-stream-options)
  asynchronously walks
  a stream,
  emitting events
  as it encounters
  JSON tokens.
  Analagous to a
  [SAX parser][sax].

The other four functions
handle the reverse transformations,
serialising
JavaScript data
to JSON:

* [`write`](#how-do-i-write-a-json-file)
  asynchronously serialises data
  to a JSON file on disk.

* [`stringify`](#how-do-i-create-a-json-string)
  asynchronously serialises data
  to a JSON string.

* [`streamify`](#how-do-i-create-a-stream-of-json)
  asynchronously serialises data
  to a stream of JSON.

* [`eventify`](#bfjeventify-data-options)
  asynchronously traverses
  a data structure
  depth-first,
  emitting events
  as it encounters items.
  By default
  it coerces
  promises, buffers and iterables
  to JSON-friendly values.

## How do I install it?

If you're using npm:

```
npm i bfj --save
```

Or if you just want
the git repo:

```
git clone git@github.com:philbooth/bfj.git
```

## How do I read a JSON file?

```js
const bfj = require('bfj');

bfj.read(path)
  .then(data => {
    // :)
  })
  .catch(error => {
    // :(
  });
```

`read` returns a [promise](promise) and
asynchronously parses
a JSON file
from disk.

It takes two arguments;
the path to the JSON file
and an [options](#options-for-parsing-functions) object.

If there are
no syntax errors,
the returned promise is resolved
with the parsed data.
If syntax errors occur,
the promise is rejected
with the first error.

## How do I write a JSON file?

```js
const bfj = require('bfj');

bfj.write(path, data)
  .then(() => {
    // :)
  })
  .catch(error => {
    // :(
  });
```

`write` returns a [promise](promise)
and asynchronously serialises a data structure
to a JSON file on disk.
The promise is resolved
when the file has been written,
or rejected with the error
if writing failed.

It takes three arguments;
the path to the JSON file,
the data structure to serialise
and an [options](#options-for-serialisation-functions) object.

## How do I parse a stream of JSON?

```js
const bfj = require('bfj');

bfj.parse(fs.createReadStream(path))
  .then(data => {
    // :)
  })
  .catch(error => {
    // :(
  });
```

`parse` returns a [promise](promise)
and asynchronously parses
a stream of JSON data.

It takes two arguments;
a [readable stream][readable]
from which
the JSON
will be parsed
and an [options](#options-for-parsing-functions) object.

If there are
no syntax errors,
the returned promise is resolved
with the parsed data.
If syntax errors occur,
the promise is rejected
with the first error.

## How do I create a JSON string?

```js
const bfj = require('bfj');

bfj.stringify(data)
  .then(json => {
    // :)
  })
  .catch(error => {
    // :(
  });
```

`stringify` returns a [promise](promise) and
asynchronously serialises a data structure
to a JSON string.
The promise is resolved
to the JSON string
when serialisation is complete.

It takes two arguments;
the data structure to serialise
and an [options](#options-for-serialisation-functions) object.

## How do I create a stream of JSON?

```js
const bfj = require('bfj');

const stream = bfj.streamify(data);

// Get data out of the stream with event handlers
stream.on('data', chunk => { /* ... */ });
stream.on('end', () => { /* ... */);
stream.on('dataError', () => { /* ... */);

// ...or you can pipe it to another stream
stream.pipe(someOtherStream);
```

`streamify` returns a [readable stream][readable]
and asynchronously serialises
a data structure to JSON,
pushing the result
to the returned stream.

It takes two arguments;
the data structure to serialise
and an [options](#options-for-serialisation-functions) object.

## What other methods are there?

### bfj.walk (stream, options)

```js
const bfj = require('bfj');

const emitter = bfj.walk(fs.createReadStream(path));

emitter.on(bfj.events.array, () => { /* ... */ });
emitter.on(bfj.events.object, () => { /* ... */ });
emitter.on(bfj.events.property, name => { /* ... */ });
emitter.on(bfj.events.string, value => { /* ... */ });
emitter.on(bfj.events.number, value => { /* ... */ });
emitter.on(bfj.events.literal, value => { /* ... */ });
emitter.on(bfj.events.endArray, () => { /* ... */ });
emitter.on(bfj.events.endObject, () => { /* ... */ });
emitter.on(bfj.events.error, error => { /* ... */ });
emitter.on(bfj.events.end, () => { /* ... */ });
```

`walk` returns an [event emitter][eventemitter]
and asynchronously walks
a stream of JSON data,
emitting events
as it encounters
tokens.

It takes two arguments;
a [readable stream][readable]
from which
the JSON
will be read
and an [options](#options-for-parsing-functions) object.

The emitted events
are defined
as public properties
of an object,
`bfj.events`:

* `bfj.events.array`
  indicates that
  an array context
  has been entered
  by encountering
  the `[` character.

* `bfj.events.endArray`
  indicates that
  an array context
  has been left
  by encountering
  the `]` character.

* `bfj.events.object`
  indicates that
  an object context
  has been entered
  by encountering
  the `{` character.

* `bfj.events.endObject`
  indicates that
  an object context
  has been left
  by encountering
  the `}` character.

* `bfj.events.property`
  indicates that
  a property
  has been encountered
  in an object.
  The listener
  will be passed
  the name of the property
  as its argument
  and the next event
  to be emitted
  will represent
  the property's value.

* `bfj.events.string`
  indicates that
  a string
  has been encountered.
  The listener
  will be passed
  the value
  as its argument.

* `bfj.events.number`
  indicates that
  a number
  has been encountered.
  The listener
  will be passed
  the value
  as its argument.

* `bfj.events.literal`
  indicates that
  a JSON literal
  (either `true`, `false` or `null`)
  has been encountered.
  The listener
  will be passed
  the value
  as its argument.

* `bfj.events.error`
  indicates that
  a syntax error
  has occurred.
  The listener
  will be passed
  the `Error` instance
  as its argument.

* `bfj.events.end`
  indicates that
  the end of the input
  has been reached
  and the stream is closed.

### bfj.eventify (data, options)

```js
const bfj = require('bfj');

const emitter = bfj.eventify(data);

emitter.on(bfj.events.array, () => { /* ... */ });
emitter.on(bfj.events.object, () => { /* ... */ });
emitter.on(bfj.events.property, name => { /* ... */ });
emitter.on(bfj.events.string, value => { /* ... */ });
emitter.on(bfj.events.number, value => { /* ... */ });
emitter.on(bfj.events.literal, value => { /* ... */ });
emitter.on(bfj.events.endArray, () => { /* ... */ });
emitter.on(bfj.events.endObject, () => { /* ... */ });
emitter.on(bfj.events.end, () => { /* ... */ });
```

`eventify` returns an [event emitter][eventemitter]
and asynchronously traverses
a data structure depth-first,
emitting events as it
encounters items.
By default it coerces
promises, buffers and iterables
to JSON-friendly values.

It takes two arguments;
the data structure to traverse
and an [options](#options-for-serialisation-functions) object.

The emitted events
are defined
as public properties
of an object,
`bfj.events`:

* `bfj.events.array`
  indicates that
  an array
  has been encountered.

* `bfj.events.endArray`
  indicates that
  the end of an array
  has been encountered.

* `bfj.events.object`
  indicates that
  an object
  has been encountered.

* `bfj.events.endObject`
  indicates that
  the end of an object
  has been encountered.

* `bfj.events.property`
  indicates that
  a property
  has been encountered
  in an object.
  The listener
  will be passed
  the name of the property
  as its argument
  and the next event
  to be emitted
  will represent
  the property's value.

* `bfj.events.string`
  indicates that
  a string
  has been encountered.
  The listener
  will be passed
  the value
  as its argument.

* `bfj.events.number`
  indicates that
  a number
  has been encountered.
  The listener
  will be passed
  the value
  as its argument.

* `bfj.events.literal`
  indicates that
  a JSON literal
  (either `true`, `false` or `null`)
  has been encountered.
  The listener
  will be passed
  the value
  as its argument.

* `bfj.events.error`
  indicates that
  a circular reference
  was encountered
  in the data.
  The listener
  will be passed
  the `Error` instance
  as its argument.

* `bfj.events.end`
  indicates that
  the end of the data
  has been reached and
  no further events
  will be emitted.

## What options can I specify?

### Options for parsing functions

* `options.reviver`:
  Transformation function,
  invoked depth-first
  against the parsed
  data structure.
  This option
  is analagous to the
  [reviver parameter for JSON.parse][reviver].

* `options.discard`:
  The number of characters
  to process before
  discarding them
  to save memory.
  The default value
  is `16384`.

### Options for serialisation functions

* `options.space`:
  Indentation string
  or the number of spaces
  to indent
  each nested level by.
  This option
  is analagous to the
  [space parameter for JSON.stringify][space].

* `options.promises`:
  By default,
  promises are coerced
  to their resolved value.
  Set this property
  to `'ignore'`
  if you'd prefer
  to ignore promises
  in the data.

* `options.buffers`:
  By default,
  buffers are coerced
  using their `toString` method.
  Set this property
  to `'ignore'`
  if you'd prefer
  to ignore buffers
  in the data.

* `options.maps`:
  By default,
  maps are coerced
  to plain objects.
  Set this property
  to `'ignore'`
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
  to `'ignore'`
  if you'd prefer
  to ignore other iterables
  in the data.

* `options.circular`:
  By default,
  circular references
  will cause the write
  to fail.
  Set this property
  to `'ignore'`
  if you'd prefer
  to silently skip past
  circular references
  in the data.

## Is there a change log?

[Yes][history].

## How do I set up the dev environment?

The development environment
relies on [Node.js][node],
[ESLint],
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

## What versions of Node.js does it support?

4 and later.

## What license is it released under?

[MIT][license].

[ci-image]: https://secure.travis-ci.org/philbooth/bfj.png?branch=master
[ci-status]: http://travis-ci.org/#!/philbooth/bfj
[sax]: http://en.wikipedia.org/wiki/Simple_API_for_XML
[promise]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise
[eventemitter]: https://nodejs.org/api/events.html#events_class_events_eventemitter
[readable]: https://nodejs.org/api/stream.html#stream_class_stream_readable
[reviver]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#Using_the_reviver_parameter
[space]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#The_space_argument
[history]: HISTORY.md
[node]: https://nodejs.org/en/
[eslint]: http://eslint.org/
[mocha]: https://mochajs.org/
[chai]: http://chaijs.com/
[mockery]: https://github.com/mfncooper/mockery
[spooks]: https://github.com/philbooth/spooks.js
[license]: COPYING

