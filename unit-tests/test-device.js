'use strict';

let assert = require('chai').assert;
let Device = require('../lib/service/device');

const URL = 'my.device.url';

// device unit tests
describe('device', () => {

  describe('constructor', () => {
    let device = new Device(URL);

    it('device', () => {
      assert.isObject(device);
      assert.instanceOf(device, Device);
    });

    it('url', () => {
      assert.property(device, 'url');
      assert.strictEqual(device.url, URL);
    });

    // request
    it('request', () => {
      assert.isFunction(device.request);
    });

    // get
    it('get', () => {
      assert.isFunction(device.get);
    });

    // restartB2G
    it('restartB2G', () => {
      assert.isFunction(device.restartB2G);
    });

    // reboot
    it('reboot', () => {
      assert.isFunction(device.reboot);
    });

    // clearLog
    it('clearLog', () => {
      assert.isFunction(device.clearLog);
    });

    // mark
    it('mark', () => {
      assert.isFunction(device.mark);
    });

    // logMemory
    it('logMemory', () => {
      assert.isFunction(device.logMemory);
    });

    // markMemory
    it('markMemory', () => {
      assert.isFunction(device.markMemory);
    });

    // kill
    it('kill', () => {
      assert.isFunction(device.kill);
    });

    // resetInput
    it('resetInput', () => {
      assert.isFunction(device.resetInput);
    });

    // getGaiaRevision
    it('getGaiaRevision', () => {
      assert.isFunction(device.getGaiaRevision);
    });

    // getGeckoRevision
    it('getGeckoRevision', () => {
      assert.isFunction(device.getGeckoRevision);
    });

    // getProperties
    it('getProperties', () => {
      assert.isFunction(device.getProperties);
    });

    // tap
    it('tap', () => {
      assert.isFunction(device.tap);
    });

    // adbForward
    it('adbForward', () => {
      assert.isFunction(device.adbForward);
    });

    // logstream
    it('logstream', () => {
      assert.isFunction(device.logstream);
    });
  });
});
