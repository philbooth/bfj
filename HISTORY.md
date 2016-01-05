# History

## 1.2.2

* Sanely escape strings when serialising (thanks [@rowanmanning](https://github.com/rowanmanning)).

## 1.2.1

* Sanely handle `undefined`, functions and symbols.

## 1.2.0

* Sanely handle circular references in the data when serialising.

## 1.1.0

* Pass `options` to `fs.createReadStream` inside `read`.
* Fix truncated output bug in `write`.

## 1.0.0

* Breaking changes:
  * Take `Readable` parameter in `walk`.
  * Return `EventEmitter` from `walk`.
  * Return `Promise` from `write`.
* Fix stream termination bug in `streamify`.
* Fix missing comma after empty objects and arrays in `streamify`.
* Improve tests.
* Add `reviver` option for `parse` and `read`.
* Add `space` option for `streamify`, `stringify` and `write`.
* Remove the `debug` option from all functions.

## 0.2.0

* Implement `eventify`.
* Implement `streamify`.
* Implement `stringify`.
* Implement `write`.

## 0.1.0

* Initial release.

