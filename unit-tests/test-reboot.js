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

    // now the properties and methods inherited from phase

    // runs
    it('runs', function() {
      assert.property(myReboot, 'runs');
      assert.isArray(myReboot.runs);
      assert.deepEqual(myReboot.runs, []);
    });

    // formattedRuns
    it('formattedRuns', function() {
      assert.property(myReboot, 'formattedRuns');
      assert.isArray(myReboot.formattedRuns);
      assert.deepEqual(myReboot.formattedRuns, []);
    });

    // results
    it('results', function() {
      assert.property(myReboot, 'results');
      assert.isArray(myReboot.results);
      assert.deepEqual(myReboot.results, []);      
    });

    // report
    it('report', function() {
      assert.isFunction(myReboot.report);
    });

    // homescreenFullyLoaded
    it('homescreenFullyLoaded', function() {
      assert.isBoolean(myReboot.homescreenFullyLoaded);
      assert.propertyVal(myReboot, 'homescreenFullyLoaded', false);
    });

    // systemFullyLoaded
    it('systemFullyLoaded', function() {
      assert.isBoolean(myReboot.systemFullyLoaded);
      assert.propertyVal(myReboot, 'systemFullyLoaded', false);
    });

    // log
    it('log', function() {
      assert.isFunction(myReboot.log);
    });

    // zeroPad
    it('zeroPad', function() {
      assert.isFunction(myReboot.zeroPad);
    });

    // timeoutError
    it('timeoutError', function() {
      assert.isFunction(myReboot.timeoutError);
    });

    // stopTimeout
    it('stopTimeout', function() {
      assert.isFunction(myReboot.stopTimeout);
    });

    // resetTimeout
    it('resetTimeout', function() {
      assert.isFunction(myReboot.resetTimeout);
    });

    // registerParser
    it('registerParser', function() {
      assert.isFunction(myReboot.registerParser);
    });

    // getDevice
    it('getDevice', function() {
      assert.isFunction(myReboot.getDevice);
    });

    // logstream
    it('logstream', function() {
      assert.isFunction(myReboot.logstream);
    });

    // setDeviceMetadata
    it('setDeviceMetadata', function() {
      assert.isFunction(myReboot.setDeviceMetadata);
    });

    // tryRun
    it('tryRun', function() {
      assert.isFunction(myReboot.tryRun);
    });

    // beforeNext
    it('beforeNext', function() {
      assert.isFunction(myReboot.beforeNext);
    });

    // afterEach
    it('afterEach', function() {
      assert.isFunction(myReboot.afterEach);
    });

    // next
    it('next', function() {
      assert.isFunction(myReboot.next);
    });

    // fail
    it('fail', function() {
      assert.isFunction(myReboot.fail);
    });

    // test
    it('test', function() {
      assert.isFunction(myReboot.test);
    });

    // resetInput
    it('resetInput', function() {
      assert.isFunction(myReboot.resetInput);
    });

    // start
    it('start', function() {
      assert.isFunction(myReboot.start);
    });

    // format
    it('format', function() {
      assert.isFunction(myReboot.format);
    });

    // createAnnotationPoint
    it('createAnnotationPoint', function() {
      assert.isFunction(myReboot.createAnnotationPoint);
    });

    // getRevisions
    it('getRevisions', function() {
      assert.isFunction(myReboot.getRevisions);
    });

    // annotate 
    it('annotate', function() {
      assert.isFunction(myReboot.annotate);
    });

    // calculateStats
    it('calculateStats', function() {
      assert.isFunction(myReboot.calculateStats);
    });

    // logStats
    it('logStats', function() {
      assert.isFunction(myReboot.logStats);
    });

    // getDeviceTags
    it('getDeviceTags', function() {
      assert.isFunction(myReboot.getDeviceTags);
    });

    // debugEventEntry
    it('debugEventEntry', function() {
      assert.isFunction(myReboot.debugEventEntry);
    });

    // waitForPerformanceEntry
    it('waitForPerformanceEntry', function() {
      assert.isFunction(myReboot.waitForPerformanceEntry);
    });

    // waitForMemory
    it('waitForMemory', function() {
      assert.isFunction(myReboot.waitForMemory);
    });

    // waitForB2GStart
    it('waitForB2GStart', function() {
      assert.isFunction(myReboot.waitForB2GStart);
    });

    // waitForHomescreen
    it('waitForHomescreen', function() {
      assert.isFunction(myReboot.waitForHomescreen);
    });

    // waitForSystem
    it('waitForSystem', function() {
      assert.isFunction(myReboot.waitForSystem);
    });

    // triggerGC
    it('triggerGC', function() {
      assert.isFunction(myReboot.triggerGC);
    });   
  });
});
