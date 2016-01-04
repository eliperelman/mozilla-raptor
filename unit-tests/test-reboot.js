'use strict';

let assert = require('chai').assert;
let Reboot = require('../lib/phases/reboot');

const OPTIONS = {
  homescreen: 'homescreen.gaiamobile.org',
  system: 'system.gaiamobile.org',
  metrics: 'metrics.ldjson',
  memoryDelay: 10000,
  timeout: 30000,
  retries: 3,
  forwardPort: 2828
};

const REBOOT_TITLE = 'Reboot';
const REBOOT_NAME = 'reboot';
const REBOOT_START_MARK = 'deviceReboot';

// reboot unit tests
describe('reboot', () => {

  describe('constructor', () => {
    let reboot = new Reboot(OPTIONS);

    it('reboot', () => {
      assert.isObject(reboot);
      assert.instanceOf(reboot, Reboot);
    });

    // options
    it('options', () => {
      assert.propertyVal(reboot, 'options', OPTIONS);
    });

    // title
    it('title', () => {
      assert.property(reboot, 'title');
      assert.strictEqual(reboot.title, REBOOT_TITLE);
    });

    // name
    it('name', () => {
      assert.property(reboot, 'name');
      assert.strictEqual(reboot.name, REBOOT_NAME);
    });

    // start mark
    it('start mark', () => {
      assert.property(reboot, 'START_MARK');
      assert.strictEqual(reboot.START_MARK, REBOOT_START_MARK);
    });

    // setup
    it('setup', () => {
      assert.isFunction(reboot.setup);
    });

    // reboot
    it('reboot', () => {
      assert.isFunction(reboot.reboot);
    });

    // restart
    it('restart', () => {
      assert.isFunction(reboot.restart);
    });

    // capture
    it('capture', () => {
      assert.isFunction(reboot.capture);
    });

    // testRun
    it('testRun', () => {
      assert.isFunction(reboot.testRun);
    });

    // retry
    it('retry', () => {
      assert.isFunction(reboot.retry);
    });

    // handleRun
    it('handleRun', () => {
      assert.isFunction(reboot.handleRun);
    });
  });
});
