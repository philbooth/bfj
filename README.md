# BFJ

[![Build status][ci-image]][ci-status]

Big-friendly JSON. Asynchronous streaming functions for large JSON data sets.

* [Why would I want those?](#why-would-i-want-those)
* [What functions does it implement?](#what-functions-does-it-implement)
* [How do I install it?](#how-do-i-install-it)
* [How do I use it?](#how-do-i-use-it)
  * [bfj.walk (stream, options)](#bfjwalk-stream-options)
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

* `walk`
  asynchronously walks
  a stream,
  emitting events
  as it encounters
  JSON tokens.
  Analagous to a
  [SAX parser][sax].

* `parse`
  asynchronously parses
  a stream of JSON.

* `read`
  asynchronously parses
  a JSON file from disk.

The four remaining functions
handle the reverse transformations;
serialising
JavaScript data
to JSON:

* `eventify`
  asynchronously traverses
  a data structure
  depth-first,
  emitting events
  as it encounters items.
  By default
  it coerces
  promises, buffers, dates and iterables
  to JSON-friendly values.

* `streamify`
  asynchronously serialises data
  to a stream of JSON.

* `stringify`
  asynchronously serialises data
  to a JSON string.

* `write`
  asynchronously serialises data
  to a JSON file on disk.

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

### bfj.walk (stream, options)

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
and an options object
that supports
the following property.

* `options.discard`:
  The number of characters
  to process before
  discarding them
  to save memory.
  The default value
  is `16384`.

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

#### Example

```js
var emitter = bfj.walk(fs.createReadStream(path));

emitter.on(bfj.events.array, array);
emitter.on(bfj.events.object, object);
emitter.on(bfj.events.property, property);
emitter.on(bfj.events.string, value);
emitter.on(bfj.events.number, value);
emitter.on(bfj.events.literal, value);
emitter.on(bfj.events.endArray, endScope);
emitter.on(bfj.events.endObject, endScope);
emitter.on(bfj.events.error, error);
emitter.on(bfj.events.end, end);
```

### bfj.parse (stream, options)

`parse` returns a [promise]
and asynchronously parses
a stream of JSON data.

It takes two arguments;
a readable stream
from which
the JSON
will be parsed
and an options object
that supports
the following properties.

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

If there are
no syntax errors,
the returned promise is resolved
with the parsed data.
If syntax errors occur,
the promise is rejected
with the first error.

#### Example

```js
bfj.parse(fs.createReadStream(path)).
    then(function (data) {
        // :)
    }).
    catch(function (error) {
        // :(
    });
```

### bfj.read (path, options)

`read` returns a promise and
asynchronously parses
a JSON file
read from disk.

It takes two arguments;
the path to the JSON file
and an options object
that supports
the following properties.

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

If there are
no syntax errors,
the returned promise is resolved
with the parsed data.
If syntax errors occur,
the promise is rejected
with the first error.

#### Example

```js
bfj.read(path).
    then(function (data) {
        // :)
    }).
    catch(function (error) {
        // :(
    });
```

### bfj.eventify (data, options)

`eventify` returns an event emitter
and asynchronously traverses
a data structure depth-first,
emitting events as it
encounters items.
By default it coerces
promises, buffers, dates and iterables
to JSON-friendly values.

It takes two arguments;
the data structure to traverse
and an options object
that supports
the following properties.

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

* `options.dates`:
  By default,
  dates are coerced
  using their `toJSON` method.
  Set this property
  to `'ignore'`
  if you'd prefer
  to ignore dates
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
  will emit an error.
  Set this property
  to `'ignore'`
  if you'd prefer
  to silently skip past
  circular references
  in the data.

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

`streamify` returns a readable stream
and asynchronously serialises
a data structure to JSON,
pushing the result
to the returned stream.

It takes two arguments;
the data structure to serialise
and an options object
that supports
the following properties.

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

* `options.dates`:
  By default,
  dates are coerced
  using their `toJSON` method.
  Set this property
  to `'ignore'`
  if you'd prefer
  to ignore dates
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
  will emit
  a 'dataError' event
  on the returned stream.
  Set this property
  to `'ignore'`
  if you'd prefer
  to silently skip past
  circular references
  in the data.

#### Example

```js
var stream = bfj.streamify(data);

stream.on('data', read);
stream.on('end', end);
stream.on('dataError', error);
```

### bfj.stringify (data, options)

`stringify` returns a promise and
asynchronously serialises a data structure
to a JSON string.
The promise is resolved
to the JSON string
when serialisation is complete.

It takes two arguments;
the data structure to serialise
and an options object
that supports
the following properties.

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

* `options.dates`:
  By default,
  dates are coerced
  using their `toJSON` method.
  Set this property
  to `'ignore'`
  if you'd prefer
  to ignore dates
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
  will reject
  the returned promise.
  Set this property
  to `'ignore'`
  if you'd prefer
  to silently skip past
  circular references
  in the data.

#### Example

```js
bfj.stringify(data).
    then(function (json) {
        // :)
    })
    .catch(function (error) {
        // :(
    });
```

### bfj.write (path, data, options)

`write` returns a promise
and asynchronously serialises a data structure
to a JSON file on disk.
The promise is resolved
when the file has been written,
or rejected with the error
if writing failed.

It takes three arguments;
the path to the JSON file,
the data structure to serialise
and an options object
that supports
the following properties.

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

* `options.dates`:
  By default,
  dates are coerced
  using their `toJSON` method.
  Set this property
  to `'ignore'`
  if you'd prefer
  to ignore dates
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

#### Example

```js
bfj.write(path, data).
    then(function () {
        // :)
    }).
    catch(function (error) {
        // :(
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
[eventemitter]: https://nodejs.org/api/events.html#events_class_events_eventemitter
[readable]: https://nodejs.org/api/stream.html#stream_class_stream_readable
[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[reviver]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#Example:_Using_the_reviver_parameter
[space]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#space_argument
[history]: HISTORY.md
[jshint]: https://github.com/jshint/node-jshint
[mocha]: https://github.com/mochajs/mocha
[chai]: https://github.com/chaijs
[mockery]: https://github.com/mfncooper/mockery
[spooks]: https://github.com/philbooth/spooks.js
[license]: COPYING

