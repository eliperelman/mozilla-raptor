'use strict';

let assert = require('chai').assert;
let Phase = require('../lib/phases/phase');

const OPTIONS = {
  app: 'communications',
  entryPoint: 'contacts',
  homescreen: 'homescreen.gaiamobile.org',
  memoryDelay: 10000,
  launchDelay: 20000,
  metrics: 'metrics.ldjson',
  runs: 30,
  timeout: 30000,
  retries: 3
};

// phase unit tests
describe('phase', () => {

  describe('constructor', () => {    
    let phase = new Phase(OPTIONS);

    it('phase', () => {
      assert.isObject(phase);
      assert.instanceOf(phase, Phase);
    });

    // options
    it('options', () => {
      assert.propertyVal(phase, 'options', OPTIONS);
    });

    // runs
    it('runs', () => {
      assert.property(phase, 'runs');
      assert.isArray(phase.runs);
      assert.deepEqual(phase.runs, []);
    });

    // formattedRuns
    it('formattedRuns', () => {
      assert.property(phase, 'formattedRuns');
      assert.isArray(phase.formattedRuns);
      assert.deepEqual(phase.formattedRuns, []);
    });

    // results
    it('results', () => {
      assert.property(phase, 'results');
      assert.isArray(phase.results);
      assert.deepEqual(phase.results, []);      
    });

    // report
    it('report', () => {
      assert.isFunction(phase.report);
    });

    // homescreenFullyLoaded
    it('homescreenFullyLoaded', () => {
      assert.isBoolean(phase.homescreenFullyLoaded);
      assert.propertyVal(phase, 'homescreenFullyLoaded', false);
    });

    // systemFullyLoaded
    it('systemFullyLoaded', () => {
      assert.isBoolean(phase.systemFullyLoaded);
      assert.propertyVal(phase, 'systemFullyLoaded', false);
    });

    // log
    it('log', () => {
      assert.isFunction(phase.log);
    });

    // zeroPad
    it('zeroPad', () => {
      assert.isFunction(phase.zeroPad);
    });

    // timeoutError
    it('timeoutError', () => {
      assert.isFunction(phase.timeoutError);
    });

    // stopTimeout
    it('stopTimeout', () => {
      assert.isFunction(phase.stopTimeout);
    });

    // resetTimeout
    it('resetTimeout', () => {
      assert.isFunction(phase.resetTimeout);
    });

    // registerParser
    it('registerParser', () => {
      assert.isFunction(phase.registerParser);
    });

    // getDevice
    it('getDevice', () => {
      assert.isFunction(phase.getDevice);
    });

    // logstream
    it('logstream', () => {
      assert.isFunction(phase.logstream);
    });

    // setDeviceMetadata
    it('setDeviceMetadata', () => {
      assert.isFunction(phase.setDeviceMetadata);
    });

    // tryRun
    it('tryRun', () => {
      assert.isFunction(phase.tryRun);
    });

    // beforeNext
    it('beforeNext', () => {
      assert.isFunction(phase.beforeNext);
    });

    // afterEach
    it('afterEach', () => {
      assert.isFunction(phase.afterEach);
    });

    // next
    it('next', () => {
      assert.isFunction(phase.next);
    });

    // fail
    it('fail', () => {
      assert.isFunction(phase.fail);
    });

    // test
    it('test', () => {
      assert.isFunction(phase.test);
    });

    // resetInput
    it('resetInput', () => {
      assert.isFunction(phase.resetInput);
    });

    // start
    it('start', () => {
      assert.isFunction(phase.start);
    });

    // format
    it('format', () => {
      assert.isFunction(phase.format);
    });

    // createAnnotationPoint
    it('createAnnotationPoint', () => {
      assert.isFunction(phase.createAnnotationPoint);
    });

    // getRevisions
    it('getRevisions', () => {
      assert.isFunction(phase.getRevisions);
    });

    // annotate 
    it('annotate', () => {
      assert.isFunction(phase.annotate);
    });

    // calculateStats
    it('calculateStats', () => {
      assert.isFunction(phase.calculateStats);
    });

    // logStats
    it('logStats', () => {
      assert.isFunction(phase.logStats);
    });

    // getDeviceTags
    it('getDeviceTags', () => {
      assert.isFunction(phase.getDeviceTags);
    });

    // debugEventEntry
    it('debugEventEntry', () => {
      assert.isFunction(phase.debugEventEntry);
    });

    // waitForPerformanceEntry
    it('waitForPerformanceEntry', () => {
      assert.isFunction(phase.waitForPerformanceEntry);
    });

    // waitForMemory
    it('waitForMemory', () => {
      assert.isFunction(phase.waitForMemory);
    });

    // waitForB2GStart
    it('waitForB2GStart', () => {
      assert.isFunction(phase.waitForB2GStart);
    });

    // waitForHomescreen
    it('waitForHomescreen', () => {
      assert.isFunction(phase.waitForHomescreen);
    });

    // waitForSystem
    it('waitForSystem', () => {
      assert.isFunction(phase.waitForSystem);
    });

    // triggerGC
    it('triggerGC', () => {
      assert.isFunction(phase.triggerGC);
    });
  });
});
