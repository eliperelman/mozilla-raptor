'use strict';

let assert = require('chai').assert;
let dispatcher = require('../lib/dispatcher/index.js');

let STREAM = 'stream';

// dispatcher unit tests
describe('dispatcher', function() {

  describe('constructor', function() {

    var myDispatcher = new dispatcher(STREAM);

    it('dispatcher', function() {
      assert.isObject(myDispatcher);
      assert.instanceOf(myDispatcher, dispatcher);
    });

    // parsers
    it('parsers', function() {
      assert.property(myDispatcher, 'parsers');
      assert.isArray(myDispatcher.parsers);
    });

    // stream
    it('stream', function() {
      assert.property(myDispatcher, 'stream');
      assert.strictEqual(myDispatcher.stream, STREAM);
    });

    it('registerParser', function() {
      assert.isFunction(myDispatcher.registerParser);
    });

    it('end', function() {
      assert.isFunction(myDispatcher.end);
    });
  });
});
