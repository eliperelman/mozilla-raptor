'use strict';

let assert = require('chai').assert;
let phase = require('../lib/phases/phase.js');

let OPTIONS = {
  'app': 'communications',
  'entryPoint': 'contacts',
  'homescreen': 'homescreen.gaiamobile.org',
  'memoryDelay': 10000,
  'launchDelay': 20000,
  'metrics': 'metrics.ldjson',
  'runs': 30,
  'timeout': 30000,
  'retries': 3
};

// phase unit tests
describe('phase', function() {

  describe('constructor', function() {    

    var myPhase = new phase(OPTIONS);

    it('phase', function() {
      assert.isObject(myPhase);
      assert.instanceOf(myPhase, phase);
    });

    // options
    it('options', function() {
      assert.propertyVal(myPhase, 'options', OPTIONS);
    });

    // runs
    it('runs', function() {
      assert.property(myPhase, 'runs');
      assert.isArray(myPhase.runs);
      assert.deepEqual(myPhase.runs, []);
    });

    // formattedRuns
    it('formattedRuns', function() {
      assert.property(myPhase, 'formattedRuns');
      assert.isArray(myPhase.formattedRuns);
      assert.deepEqual(myPhase.formattedRuns, []);
    });

    // results
    it('results', function() {
      assert.property(myPhase, 'results');
      assert.isArray(myPhase.results);
      assert.deepEqual(myPhase.results, []);      
    });

    // report
    it('report', function() {
      assert.isFunction(myPhase.report);
    });

    // homescreenFullyLoaded
    it('homescreenFullyLoaded', function() {
      assert.isBoolean(myPhase.homescreenFullyLoaded);
      assert.propertyVal(myPhase, 'homescreenFullyLoaded', false);
    });

    // systemFullyLoaded
    it('systemFullyLoaded', function() {
      assert.isBoolean(myPhase.systemFullyLoaded);
      assert.propertyVal(myPhase, 'systemFullyLoaded', false);
    });

    // log
    it('log', function() {
      assert.isFunction(myPhase.log);
    });

    // zeroPad
    it('zeroPad', function() {
      assert.isFunction(myPhase.zeroPad);
    });

    // timeoutError
    it('timeoutError', function() {
      assert.isFunction(myPhase.timeoutError);
    });

    // stopTimeout
    it('stopTimeout', function() {
      assert.isFunction(myPhase.stopTimeout);
    });

    // resetTimeout
    it('resetTimeout', function() {
      assert.isFunction(myPhase.resetTimeout);
    });

    // registerParser
    it('registerParser', function() {
      assert.isFunction(myPhase.registerParser);
    });

    // getDevice
    it('getDevice', function() {
      assert.isFunction(myPhase.getDevice);
    });

    // logstream
    it('logstream', function() {
      assert.isFunction(myPhase.logstream);
    });

    // setDeviceMetadata
    it('setDeviceMetadata', function() {
      assert.isFunction(myPhase.setDeviceMetadata);
    });

    // tryRun
    it('tryRun', function() {
      assert.isFunction(myPhase.tryRun);
    });

    // beforeNext
    it('beforeNext', function() {
      assert.isFunction(myPhase.beforeNext);
    });

    // afterEach
    it('afterEach', function() {
      assert.isFunction(myPhase.afterEach);
    });

    // next
    it('next', function() {
      assert.isFunction(myPhase.next);
    });

    // fail
    it('fail', function() {
      assert.isFunction(myPhase.fail);
    });

    // test
    it('test', function() {
      assert.isFunction(myPhase.test);
    });

    // resetInput
    it('resetInput', function() {
      assert.isFunction(myPhase.resetInput);
    });

    // start
    it('start', function() {
      assert.isFunction(myPhase.start);
    });

    // format
    it('format', function() {
      assert.isFunction(myPhase.format);
    });

    // createAnnotationPoint
    it('createAnnotationPoint', function() {
      assert.isFunction(myPhase.createAnnotationPoint);
    });

    // getRevisions
    it('getRevisions', function() {
      assert.isFunction(myPhase.getRevisions);
    });

    // annotate 
    it('annotate', function() {
      assert.isFunction(myPhase.annotate);
    });

    // calculateStats
    it('calculateStats', function() {
      assert.isFunction(myPhase.calculateStats);
    });

    // logStats
    it('logStats', function() {
      assert.isFunction(myPhase.logStats);
    });

    // getDeviceTags
    it('getDeviceTags', function() {
      assert.isFunction(myPhase.getDeviceTags);
    });

    // debugEventEntry
    it('debugEventEntry', function() {
      assert.isFunction(myPhase.debugEventEntry);
    });

    // waitForPerformanceEntry
    it('waitForPerformanceEntry', function() {
      assert.isFunction(myPhase.waitForPerformanceEntry);
    });

    // waitForMemory
    it('waitForMemory', function() {
      assert.isFunction(myPhase.waitForMemory);
    });

    // waitForB2GStart
    it('waitForB2GStart', function() {
      assert.isFunction(myPhase.waitForB2GStart);
    });

    // waitForHomescreen
    it('waitForHomescreen', function() {
      assert.isFunction(myPhase.waitForHomescreen);
    });

    // waitForSystem
    it('waitForSystem', function() {
      assert.isFunction(myPhase.waitForSystem);
    });

    // triggerGC
    it('triggerGC', function() {
      assert.isFunction(myPhase.triggerGC);
    });
  });
});
