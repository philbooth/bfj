# History

## 1.0.0

* Breaking changes:
  * Take `Readable` parameter in `walk`.
  * Return `EventEmitter` parameter from `walk`.
  * Return `Promise` parameter from `write`.
* Fix stream termination bug in `streamify`.
* Fix missing comma after empty objects and arrays.
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

