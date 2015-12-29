'use strict';

let assert = require('chai').assert;
let marionette = require('../lib/marionette.js');

let OPTIONS = {
  'marionetteHost': 'localhost',
  'marionettePort': 2828,
  'connectionTimeout': 10000,
  'scriptTimeout': 30000
};

// marionette unit tests
describe('marionette', function() {

  describe('constructor', function() {

    var myMarionette = new marionette(OPTIONS);

    it('marionette', function() {
      assert.isObject(myMarionette);
      assert.instanceOf(myMarionette, marionette);
    });

    // host
    it('host', function() {
      assert.property(myMarionette, 'host');
      assert.strictEqual(myMarionette.host, OPTIONS.marionetteHost);
    });

    // port
    it('port', function() {
      assert.property(myMarionette, 'port');
      assert.strictEqual(myMarionette.port, OPTIONS.marionettePort);
    });

    // timeout
    it('timeout', function() {
      assert.property(myMarionette, 'timeout');
      assert.strictEqual(myMarionette.timeout, OPTIONS.connectionTimeout);
    });

    // scriptTimeout
    it('scriptTimeout', function() {
      assert.property(myMarionette, 'scriptTimeout');
      assert.strictEqual(myMarionette.scriptTimeout, OPTIONS.scriptTimeout);
    });

    // start session
    it('start session', function() {
      assert.isFunction(myMarionette.startSession);
    });

    // switchToHomescreen
    it('switchToHomescreen', function() {
      assert.isFunction(myMarionette.switchToHomescreen);
    });

    // clearPerformanceBuffer
    it('clearPerformanceBuffer', function() {
      assert.isFunction(myMarionette.clearPerformanceBuffer);
    });

    // deleteSession
    it('deleteSession', function() {
      assert.isFunction(myMarionette.deleteSession);
    });
  });
});
