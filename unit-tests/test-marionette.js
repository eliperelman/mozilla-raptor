'use strict';

let assert = require('chai').assert;
let Marionette = require('../lib/marionette');

const OPTIONS = {
  marionetteHost: 'localhost',
  marionettePort: 2828,
  connectionTimeout: 10000,
  scriptTimeout: 30000
};

// marionette unit tests
describe('marionette', () => {

  describe('constructor', () => {
    let marionette = new Marionette(OPTIONS);

    it('marionette', () => {
      assert.isObject(marionette);
      assert.instanceOf(marionette, Marionette);
    });

    // host
    it('host', () => {
      assert.property(marionette, 'host');
      assert.strictEqual(marionette.host, OPTIONS.marionetteHost);
    });

    // port
    it('port', () => {
      assert.property(marionette, 'port');
      assert.strictEqual(marionette.port, OPTIONS.marionettePort);
    });

    // timeout
    it('timeout', () => {
      assert.property(marionette, 'timeout');
      assert.strictEqual(marionette.timeout, OPTIONS.connectionTimeout);
    });

    // scriptTimeout
    it('scriptTimeout', () => {
      assert.property(marionette, 'scriptTimeout');
      assert.strictEqual(marionette.scriptTimeout, OPTIONS.scriptTimeout);
    });

    // start session
    it('start session', () => {
      assert.isFunction(marionette.startSession);
    });

    // switchToHomescreen
    it('switchToHomescreen', () => {
      assert.isFunction(marionette.switchToHomescreen);
    });

    // clearPerformanceBuffer
    it('clearPerformanceBuffer', () => {
      assert.isFunction(marionette.clearPerformanceBuffer);
    });

    // deleteSession
    it('deleteSession', () => {
      assert.isFunction(marionette.deleteSession);
    });
  });
});
