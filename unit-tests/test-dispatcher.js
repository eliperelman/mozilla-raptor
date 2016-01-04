'use strict';

let assert = require('chai').assert;
let Dispatcher = require('../lib/dispatcher');

const STREAM = 'stream';

// dispatcher unit tests
describe('dispatcher', () => {

  describe('constructor', () => {
    let dispatcher = new Dispatcher(STREAM);

    it('dispatcher', () => {
      assert.isObject(dispatcher);
      assert.instanceOf(dispatcher, Dispatcher);
    });

    // parsers
    it('parsers', () => {
      assert.property(dispatcher, 'parsers');
      assert.isArray(dispatcher.parsers);
    });

    // stream
    it('stream', () => {
      assert.property(dispatcher, 'stream');
      assert.strictEqual(dispatcher.stream, STREAM);
    });

    it('registerParser', () => {
      assert.isFunction(dispatcher.registerParser);
    });

    it('end', () => {
      assert.isFunction(dispatcher.end);
    });
  });
});
