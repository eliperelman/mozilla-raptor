'use strict';

let assert = require('chai').assert;
let device = require('../lib/service/device.js');

let URL = 'my.device.url';

// device unit tests
describe('device', function() {

  describe('constructor', function() {

    var myDevice = new device(URL);

    it('device', function() {
      assert.isObject(myDevice);
      assert.instanceOf(myDevice, device);
    });

    it('url', function() {
      assert.property(myDevice, 'url');
      assert.strictEqual(myDevice.url, URL);
    });

    // request
    it('request', function() {
      assert.isFunction(myDevice.request);
    });

    // get
    it('get', function() {
      assert.isFunction(myDevice.get);
    });

    // restartB2G
    it('restartB2G', function() {
      assert.isFunction(myDevice.restartB2G);
    });

    // reboot
    it('reboot', function() {
      assert.isFunction(myDevice.reboot);
    });

    // clearLog
    it('clearLog', function() {
      assert.isFunction(myDevice.clearLog);
    });

    // mark
    it('mark', function() {
      assert.isFunction(myDevice.mark);
    });

    // logMemory
    it('logMemory', function() {
      assert.isFunction(myDevice.logMemory);
    });

    // markMemory
    it('markMemory', function() {
      assert.isFunction(myDevice.markMemory);
    });

    // kill
    it('kill', function() {
      assert.isFunction(myDevice.kill);
    });

    // resetInput
    it('resetInput', function() {
      assert.isFunction(myDevice.resetInput);
    });

    // getGaiaRevision
    it('getGaiaRevision', function() {
      assert.isFunction(myDevice.getGaiaRevision);
    });

    // getGeckoRevision
    it('getGeckoRevision', function() {
      assert.isFunction(myDevice.getGeckoRevision);
    });

    // getProperties
    it('getProperties', function() {
      assert.isFunction(myDevice.getProperties);
    });

    // tap
    it('tap', function() {
      assert.isFunction(myDevice.tap);
    });

    // adbForward
    it('adbForward', function() {
      assert.isFunction(myDevice.adbForward);
    });

    // logstream
    it('logstream', function() {
      assert.isFunction(myDevice.logstream);
    });
  });
});
