'use strict';

let assert = require('chai').assert;
let restartB2G = require('../lib/phases/restart-b2g.js');

let OPTIONS = {
  'homescreen': 'homescreen.gaiamobile.org',
  'system': 'system.gaiamobile.org',
  'metrics': 'metrics.ldjson',
  'memoryDelay': 10000,
  'timeout': 30000,
  'retries': 3,
  'forwardPort': 2828
};

let RESTART_TITLE = 'Restart B2G';
let RESTART_NAME = 'restartb2g';
let RESTART_START_MARK = 'deviceB2GStart';

// restart-b2g unit tests
describe('restart-b2g', function() {

  describe('constructor', function() {

    var myRestart = new restartB2G(OPTIONS);

    it('restart-b2g', function() {
      assert.isObject(myRestart);
      assert.instanceOf(myRestart, restartB2G);
    });

    // options
    it('options', function() {
      assert.propertyVal(myRestart, 'options', OPTIONS);
    });

    // title
    it('title', function() {
      assert.property(myRestart, 'title');
      assert.strictEqual(myRestart.title, RESTART_TITLE);
    });

    // name
    it('name', function() {
      assert.property(myRestart, 'name');
      assert.strictEqual(myRestart.name, RESTART_NAME);
    });

    // start mark
    it('start mark', function() {
      assert.property(myRestart, 'START_MARK');
      assert.strictEqual(myRestart.START_MARK, RESTART_START_MARK);
    });

    // restart
    it('restart', function() {
      assert.isFunction(myRestart.restart);
    });
  });
});
