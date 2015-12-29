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

    // now the properties and methods inherited from phase

    // runs
    it('runs', function() {
      assert.property(myRestart, 'runs');
      assert.isArray(myRestart.runs);
      assert.deepEqual(myRestart.runs, []);
    });

    // formattedRuns
    it('formattedRuns', function() {
      assert.property(myRestart, 'formattedRuns');
      assert.isArray(myRestart.formattedRuns);
      assert.deepEqual(myRestart.formattedRuns, []);
    });

    // results
    it('results', function() {
      assert.property(myRestart, 'results');
      assert.isArray(myRestart.results);
      assert.deepEqual(myRestart.results, []);      
    });

    // report
    it('report', function() {
      assert.isFunction(myRestart.report);
    });

    // homescreenFullyLoaded
    it('homescreenFullyLoaded', function() {
      assert.isBoolean(myRestart.homescreenFullyLoaded);
      assert.propertyVal(myRestart, 'homescreenFullyLoaded', false);
    });

    // systemFullyLoaded
    it('systemFullyLoaded', function() {
      assert.isBoolean(myRestart.systemFullyLoaded);
      assert.propertyVal(myRestart, 'systemFullyLoaded', false);
    });

    // log
    it('log', function() {
      assert.isFunction(myRestart.log);
    });

    // zeroPad
    it('zeroPad', function() {
      assert.isFunction(myRestart.zeroPad);
    });

    // timeoutError
    it('timeoutError', function() {
      assert.isFunction(myRestart.timeoutError);
    });

    // stopTimeout
    it('stopTimeout', function() {
      assert.isFunction(myRestart.stopTimeout);
    });

    // resetTimeout
    it('resetTimeout', function() {
      assert.isFunction(myRestart.resetTimeout);
    });

    // registerParser
    it('registerParser', function() {
      assert.isFunction(myRestart.registerParser);
    });

    // getDevice
    it('getDevice', function() {
      assert.isFunction(myRestart.getDevice);
    });

    // logstream
    it('logstream', function() {
      assert.isFunction(myRestart.logstream);
    });

    // setDeviceMetadata
    it('setDeviceMetadata', function() {
      assert.isFunction(myRestart.setDeviceMetadata);
    });

    // tryRun
    it('tryRun', function() {
      assert.isFunction(myRestart.tryRun);
    });

    // beforeNext
    it('beforeNext', function() {
      assert.isFunction(myRestart.beforeNext);
    });

    // afterEach
    it('afterEach', function() {
      assert.isFunction(myRestart.afterEach);
    });

    // next
    it('next', function() {
      assert.isFunction(myRestart.next);
    });

    // fail
    it('fail', function() {
      assert.isFunction(myRestart.fail);
    });

    // test
    it('test', function() {
      assert.isFunction(myRestart.test);
    });

    // resetInput
    it('resetInput', function() {
      assert.isFunction(myRestart.resetInput);
    });

    // start
    it('start', function() {
      assert.isFunction(myRestart.start);
    });

    // format
    it('format', function() {
      assert.isFunction(myRestart.format);
    });

    // createAnnotationPoint
    it('createAnnotationPoint', function() {
      assert.isFunction(myRestart.createAnnotationPoint);
    });

    // getRevisions
    it('getRevisions', function() {
      assert.isFunction(myRestart.getRevisions);
    });

    // annotate 
    it('annotate', function() {
      assert.isFunction(myRestart.annotate);
    });

    // calculateStats
    it('calculateStats', function() {
      assert.isFunction(myRestart.calculateStats);
    });

    // logStats
    it('logStats', function() {
      assert.isFunction(myRestart.logStats);
    });

    // getDeviceTags
    it('getDeviceTags', function() {
      assert.isFunction(myRestart.getDeviceTags);
    });

    // debugEventEntry
    it('debugEventEntry', function() {
      assert.isFunction(myRestart.debugEventEntry);
    });

    // waitForPerformanceEntry
    it('waitForPerformanceEntry', function() {
      assert.isFunction(myRestart.waitForPerformanceEntry);
    });

    // waitForMemory
    it('waitForMemory', function() {
      assert.isFunction(myRestart.waitForMemory);
    });

    // waitForB2GStart
    it('waitForB2GStart', function() {
      assert.isFunction(myRestart.waitForB2GStart);
    });

    // waitForHomescreen
    it('waitForHomescreen', function() {
      assert.isFunction(myRestart.waitForHomescreen);
    });

    // waitForSystem
    it('waitForSystem', function() {
      assert.isFunction(myRestart.waitForSystem);
    });

    // triggerGC
    it('triggerGC', function() {
      assert.isFunction(myRestart.triggerGC);
    });
  });
});
