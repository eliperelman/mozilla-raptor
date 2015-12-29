'use strict';

let assert = require('chai').assert;
let coldlaunch = require('../lib/phases/cold-launch.js');

let OPTIONS = {
  'app': 'communications',
  'entryPoint': 'contacts',
  'homescreen': 'homescreen.gaiamobile.org',
  'system': 'system.gaiamobile.org',
  'memoryDelay': 10000,
  'launchDelay': 20000,
  'metrics': 'metrics.ldjson',
  'runs': 30,
  'timeout': 30000,
  'retries': 3
};

let COLDLAUNCH_TITLE = 'Cold Launch: ' + OPTIONS.app;
let COLDLAUNCH_NAME = 'coldlaunch';
let COLDLAUNCH_START_MARK = 'appLaunch';

// cold-launch unit tests
describe('cold-launch', function() {

  describe('constructor', function() {

    var myColdLaunch = new coldlaunch(OPTIONS);

    it('coldlaunch', function() {
      assert.isObject(myColdLaunch);
      assert.instanceOf(myColdLaunch, coldlaunch);
    });

    // options
    it('options', function() {
      assert.propertyVal(myColdLaunch, 'options', OPTIONS);
    });

    // title
    it('title', function() {
      assert.property(myColdLaunch, 'title');
      assert.strictEqual(myColdLaunch.title, COLDLAUNCH_TITLE);
    });

    // name
    it('name', function() {
      assert.property(myColdLaunch, 'name');
      assert.strictEqual(myColdLaunch.name, COLDLAUNCH_NAME);
    });

    // start mark
    it('start mark', function() {
      assert.property(myColdLaunch, 'START_MARK');
      assert.strictEqual(myColdLaunch.START_MARK, COLDLAUNCH_START_MARK);
    });

    // launches buffered
    it('launches buffered', function() {
      assert.property(myColdLaunch, 'launchesBuffered');
      assert.strictEqual(myColdLaunch.launchesBuffered, 0);
    });

    // capture
    it('capture', function() {
      assert.isFunction(myColdLaunch.capture);
    });

    // captureEntryMetadata
    it('captureEntryMetadata', function() {
      assert.isFunction(myColdLaunch.captureEntryMetadata);
    });

    // launch
    it('launch', function() {
      assert.isFunction(myColdLaunch.launch);
    });

    // prime
    it('prime', function() {
      assert.isFunction(myColdLaunch.prime);
    });

    // preventBufferOverflow
    it('preventBufferOverflow', function() {
      assert.isFunction(myColdLaunch.preventBufferOverflow);
    });

    // testRun
    it('testRun', function() {
      assert.isFunction(myColdLaunch.testRun);
    });

    // prime
    it('prime', function() {
      assert.isFunction(myColdLaunch.prime);
    });

    // closeApp
    it('closeApp', function() {
      assert.isFunction(myColdLaunch.closeApp);
    });

    // retry
    it('retry', function() {
      assert.isFunction(myColdLaunch.retry);
    });

    // handleRun
    it('handleRun', function() {
      assert.isFunction(myColdLaunch.handleRun);
    });

    // now the properties and methods inherited from phase

    // runs
    it('runs', function() {
      assert.property(myColdLaunch, 'runs');
      assert.isArray(myColdLaunch.runs);
      assert.deepEqual(myColdLaunch.runs, []);
    });

    // formattedRuns
    it('formattedRuns', function() {
      assert.property(myColdLaunch, 'formattedRuns');
      assert.isArray(myColdLaunch.formattedRuns);
      assert.deepEqual(myColdLaunch.formattedRuns, []);
    });

    // results
    it('results', function() {
      assert.property(myColdLaunch, 'results');
      assert.isArray(myColdLaunch.results);
      assert.deepEqual(myColdLaunch.results, []);      
    });

    // report
    it('report', function() {
      assert.isFunction(myColdLaunch.report);
    });

    // homescreenFullyLoaded
    it('homescreenFullyLoaded', function() {
      assert.isBoolean(myColdLaunch.homescreenFullyLoaded);
      assert.propertyVal(myColdLaunch, 'homescreenFullyLoaded', false);
    });

    // systemFullyLoaded
    it('systemFullyLoaded', function() {
      assert.isBoolean(myColdLaunch.systemFullyLoaded);
      assert.propertyVal(myColdLaunch, 'systemFullyLoaded', false);
    });

    // log
    it('log', function() {
      assert.isFunction(myColdLaunch.log);
    });

    // zeroPad
    it('zeroPad', function() {
      assert.isFunction(myColdLaunch.zeroPad);
    });

    // timeoutError
    it('timeoutError', function() {
      assert.isFunction(myColdLaunch.timeoutError);
    });

    // stopTimeout
    it('stopTimeout', function() {
      assert.isFunction(myColdLaunch.stopTimeout);
    });

    // resetTimeout
    it('resetTimeout', function() {
      assert.isFunction(myColdLaunch.resetTimeout);
    });

    // registerParser
    it('registerParser', function() {
      assert.isFunction(myColdLaunch.registerParser);
    });

    // getDevice
    it('getDevice', function() {
      assert.isFunction(myColdLaunch.getDevice);
    });

    // logstream
    it('logstream', function() {
      assert.isFunction(myColdLaunch.logstream);
    });

    // setDeviceMetadata
    it('setDeviceMetadata', function() {
      assert.isFunction(myColdLaunch.setDeviceMetadata);
    });

    // tryRun
    it('tryRun', function() {
      assert.isFunction(myColdLaunch.tryRun);
    });

    // beforeNext
    it('beforeNext', function() {
      assert.isFunction(myColdLaunch.beforeNext);
    });

    // afterEach
    it('afterEach', function() {
      assert.isFunction(myColdLaunch.afterEach);
    });

    // next
    it('next', function() {
      assert.isFunction(myColdLaunch.next);
    });

    // fail
    it('fail', function() {
      assert.isFunction(myColdLaunch.fail);
    });

    // test
    it('test', function() {
      assert.isFunction(myColdLaunch.test);
    });

    // resetInput
    it('resetInput', function() {
      assert.isFunction(myColdLaunch.resetInput);
    });

    // start
    it('start', function() {
      assert.isFunction(myColdLaunch.start);
    });

    // format
    it('format', function() {
      assert.isFunction(myColdLaunch.format);
    });

    // createAnnotationPoint
    it('createAnnotationPoint', function() {
      assert.isFunction(myColdLaunch.createAnnotationPoint);
    });

    // getRevisions
    it('getRevisions', function() {
      assert.isFunction(myColdLaunch.getRevisions);
    });

    // annotate 
    it('annotate', function() {
      assert.isFunction(myColdLaunch.annotate);
    });

    // calculateStats
    it('calculateStats', function() {
      assert.isFunction(myColdLaunch.calculateStats);
    });

    // logStats
    it('logStats', function() {
      assert.isFunction(myColdLaunch.logStats);
    });

    // getDeviceTags
    it('getDeviceTags', function() {
      assert.isFunction(myColdLaunch.getDeviceTags);
    });

    // debugEventEntry
    it('debugEventEntry', function() {
      assert.isFunction(myColdLaunch.debugEventEntry);
    });

    // waitForPerformanceEntry
    it('waitForPerformanceEntry', function() {
      assert.isFunction(myColdLaunch.waitForPerformanceEntry);
    });

    // waitForMemory
    it('waitForMemory', function() {
      assert.isFunction(myColdLaunch.waitForMemory);
    });

    // waitForB2GStart
    it('waitForB2GStart', function() {
      assert.isFunction(myColdLaunch.waitForB2GStart);
    });

    // waitForHomescreen
    it('waitForHomescreen', function() {
      assert.isFunction(myColdLaunch.waitForHomescreen);
    });

    // waitForSystem
    it('waitForSystem', function() {
      assert.isFunction(myColdLaunch.waitForSystem);
    });

    // triggerGC
    it('triggerGC', function() {
      assert.isFunction(myColdLaunch.triggerGC);
    });

    // --app not provided throws an error
    it('error thrown when --app not provided', function() {

      let errorFunc = function() {
        let options = {
          'metrics': 'metrics.ldjson',
          'runs': 30
        };
          var myColdLaunch = new coldlaunch(options);
      }

      assert.throw(errorFunc, '--app is required for cold-launch phase');
    });
  });
});
