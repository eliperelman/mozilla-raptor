'use strict';

let assert = require('chai').assert;
let RestartB2G = require('../lib/phases/restart-b2g');

const OPTIONS = {
  homescreen: 'homescreen.gaiamobile.org',
  system: 'system.gaiamobile.org',
  metrics: 'metrics.ldjson',
  memoryDelay: 10000,
  timeout: 30000,
  retries: 3,
  forwardPort: 2828
};

const RESTART_TITLE = 'Restart B2G';
const RESTART_NAME = 'restartb2g';
const RESTART_START_MARK = 'deviceB2GStart';

// restart-b2g unit tests
describe('restart-b2g', () => {

  describe('constructor', () => {
    let restart = new RestartB2G(OPTIONS);

    it('restart-b2g', () => {
      assert.isObject(restart);
      assert.instanceOf(restart, RestartB2G);
    });

    // options
    it('options', () => {
      assert.propertyVal(restart, 'options', OPTIONS);
    });

    // title
    it('title', () => {
      assert.property(restart, 'title');
      assert.strictEqual(restart.title, RESTART_TITLE);
    });

    // name
    it('name', () => {
      assert.property(restart, 'name');
      assert.strictEqual(restart.name, RESTART_NAME);
    });

    // start mark
    it('start mark', () => {
      assert.property(restart, 'START_MARK');
      assert.strictEqual(restart.START_MARK, RESTART_START_MARK);
    });

    // restart
    it('restart', () => {
      assert.isFunction(restart.restart);
    });
  });
});
