'use strict';

let assert = require('chai').assert;
let reboot = require('../lib/phases/reboot.js');

let OPTIONS = {
  'homescreen': 'homescreen.gaiamobile.org',
  'system': 'system.gaiamobile.org',
  'metrics': 'metrics.ldjson',
  'memoryDelay': 10000,
  'timeout': 30000,
  'retries': 3,
  'forwardPort': 2828
};

let REBOOT_TITLE = 'Reboot';
let REBOOT_NAME = 'reboot';
let REBOOT_START_MARK = 'deviceReboot';

// reboot unit tests
describe('reboot', function() {

  describe('constructor', function() {

    var myReboot = new reboot(OPTIONS);

    it('reboot', function() {
      assert.isObject(myReboot);
      assert.instanceOf(myReboot, reboot);
    });

    // options
    it('options', function() {
      assert.propertyVal(myReboot, 'options', OPTIONS);
    });

    // title
    it('title', function() {
      assert.property(myReboot, 'title');
      assert.strictEqual(myReboot.title, REBOOT_TITLE);
    });

    // name
    it('name', function() {
      assert.property(myReboot, 'name');
      assert.strictEqual(myReboot.name, REBOOT_NAME);
    });

    // start mark
    it('start mark', function() {
      assert.property(myReboot, 'START_MARK');
      assert.strictEqual(myReboot.START_MARK, REBOOT_START_MARK);
    });

    // setup
    it('setup', function() {
      assert.isFunction(myReboot.setup);
    });

    // reboot
    it('reboot', function() {
      assert.isFunction(myReboot.reboot);
    });

    // restart
    it('restart', function() {
      assert.isFunction(myReboot.restart);
    });

    // capture
    it('capture', function() {
      assert.isFunction(myReboot.capture);
    });

    // testRun
    it('testRun', function() {
      assert.isFunction(myReboot.testRun);
    });

    // retry
    it('retry', function() {
      assert.isFunction(myReboot.retry);
    });

    // handleRun
    it('handleRun', function() {
      assert.isFunction(myReboot.handleRun);
    });
  });
});
