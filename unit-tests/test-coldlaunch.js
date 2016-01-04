'use strict';

let assert = require('chai').assert;
let ColdLaunch = require('../lib/phases/cold-launch');

const OPTIONS = {
  app: 'communications',
  entryPoint: 'contacts',
  homescreen: 'homescreen.gaiamobile.org',
  system: 'system.gaiamobile.org',
  memoryDelay: 10000,
  launchDelay: 20000,
  metrics: 'metrics.ldjson',
  runs: 30,
  timeout: 30000,
  retries: 3
};

const COLDLAUNCH_TITLE = 'Cold Launch: ' + OPTIONS.app;
const COLDLAUNCH_NAME = 'coldlaunch';
const COLDLAUNCH_START_MARK = 'appLaunch';

// cold-launch unit tests
describe('cold-launch', () => {

  describe('constructor', () => {
    let coldlaunch = new ColdLaunch(OPTIONS);

    it('coldlaunch', () => {
      assert.isObject(coldlaunch);
      assert.instanceOf(coldlaunch, ColdLaunch);
    });

    // options
    it('options', () => {
      assert.propertyVal(coldlaunch, 'options', OPTIONS);
    });

    // title
    it('title', () => {
      assert.property(coldlaunch, 'title');
      assert.strictEqual(coldlaunch.title, COLDLAUNCH_TITLE);
    });

    // name
    it('name', () => {
      assert.property(coldlaunch, 'name');
      assert.strictEqual(coldlaunch.name, COLDLAUNCH_NAME);
    });

    // start mark
    it('start mark', () => {
      assert.property(coldlaunch, 'START_MARK');
      assert.strictEqual(coldlaunch.START_MARK, COLDLAUNCH_START_MARK);
    });

    // launches buffered
    it('launches buffered', () => {
      assert.property(coldlaunch, 'launchesBuffered');
      assert.strictEqual(coldlaunch.launchesBuffered, 0);
    });

    // capture
    it('capture', () => {
      assert.isFunction(coldlaunch.capture);
    });

    // captureEntryMetadata
    it('captureEntryMetadata', () => {
      assert.isFunction(coldlaunch.captureEntryMetadata);
    });

    // launch
    it('launch', () => {
      assert.isFunction(coldlaunch.launch);
    });

    // prime
    it('prime', () => {
      assert.isFunction(coldlaunch.prime);
    });

    // preventBufferOverflow
    it('preventBufferOverflow', () => {
      assert.isFunction(coldlaunch.preventBufferOverflow);
    });

    // testRun
    it('testRun', () => {
      assert.isFunction(coldlaunch.testRun);
    });

    // prime
    it('prime', () => {
      assert.isFunction(coldlaunch.prime);
    });

    // closeApp
    it('closeApp', () => {
      assert.isFunction(coldlaunch.closeApp);
    });

    // retry
    it('retry', () => {
      assert.isFunction(coldlaunch.retry);
    });

    // handleRun
    it('handleRun', () => {
      assert.isFunction(coldlaunch.handleRun);
    });

    // --app not provided throws an error
    it('error thrown when --app not provided', () => {

      let errorFunc = () => {
        let options = {
          'metrics': 'metrics.ldjson',
          'runs': 30
        };
        let coldlaunch = new ColdLaunch(options);
      }

      assert.throw(errorFunc, '--app is required for cold-launch phase');
    });
  });
});
