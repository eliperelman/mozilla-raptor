'use strict';

let crypto = require('crypto');
let debug = require('debug')('raptor:phase');
let Dispatcher = require('../dispatcher');
let EventEmitter = require('events').EventEmitter;
let influent = require('influent');
let Marionette = require('../marionette');
let memoryParser = require('../parsers/memory');
let markdownTable = require('markdown-table');
let performanceParser = require('../parsers/performance');
let R = require('ramda');
let reporter = require('../reporter');
let service = require('../service');
let stats = require('stats-lite');
let util = require('util');
let utils = require('../utils');

let Value = influent.Value;

/**
 * Base phase. Functionality which is common to all phases should be
 * accessible here
 * @param {{
 *   runs: Number,
 *   timeout: Number,
 *   retries: Number,
 *   preventDispatching: Boolean
 * }} options
 * @constructor
 */
let Phase = function(options) {
  EventEmitter.call(this);

  this.runs = [];
  this.results = [];
  this.formattedRuns = [];
  this.options = options;
  this.report = reporter(options);

  this.log('@mozilla/raptor : Preparing to start testing...');
  this.resetTimeout();
};

util.inherits(Phase, EventEmitter);

Phase.prototype.homescreenFullyLoaded = false;
Phase.prototype.systemFullyLoaded = false;

Phase.PERFORMANCEENTRY = 'performanceentry';
Phase.MEMORYENTRY = 'memoryentry';
Phase.TAG_IDENTIFIER = 'persist.raptor.';
Phase.PERFORMANCE_BUFFER_SAFETY = 50;
Phase.ICON_TAP_OFFSET = 20;
Phase.NOOP = function() {};

/**
 * Send phase-formatted message(s) to the console. Takes same arguments as
 * console.log
 */
Phase.prototype.log = function() {
  if (this.options.output !== 'console') {
    return;
  }

  let args = Array.prototype.slice.call(arguments);

  args.splice(1, 0, this.title);
  args[0] = '[%s] ' + arguments[0];

  console.log.apply(console, args);
};

Phase.prototype.zeroPad = function(number) {
  return ('000000' + number).substr(number.toString().length);
};

/**
 * Emit an error if a test run times out
 */
Phase.prototype.timeoutError = function() {
  this.emit('error',
    new Error(`Test timeout exceeded ${this.options.timeout}ms`));
};

/**
 * Halt handling of a test run timeout
 */
Phase.prototype.stopTimeout = function() {
  if (this.timeout) {
    clearTimeout(this.timeout);
  }
};

/**
 * Restart the timeout timer and optionally specify a function to run on timeout
 * @param {function} [handler]
 */
Phase.prototype.resetTimeout = function(handler) {
  this.stopTimeout();
  this.timeout = setTimeout(handler || (() => this.timeoutError()), this.options.timeout);
};

/**
 * Register a parser to be able to handle incoming log messages
 * @param {function} parser
 */
Phase.prototype.registerParser = function(parser) {
  this.dispatcher.registerParser(parser);
};

/**
 * Resolve when a device is ready for user interaction, e.g. tapping, swiping
 * @returns {Promise}
 */
Phase.prototype.getDevice = function() {
  if (this.device) {
    return Promise.resolve(this.device);
  }

  return service(this.options)
    .then(device => this.device = device)
    .then(() => this.setDeviceMetadata())
    .then(() => {
      let device = this.device;
      let options = this.options;
      let port = options.forwardPort || options.marionettePort;

      if (options.preventDispatching) {
        return device;
      }

      return this
        .logstream()
        .then(stream => this.dispatcher = new Dispatcher(stream))
        .then(() => this.registerParser(performanceParser))
        .then(() => this.registerParser(memoryParser))
        .then(() => device.adbForward(port))
        .then(port => this.marionette = new Marionette(R.merge(options, { port })))
        .then(() => device);
    })
    .catch(err => this.emit('error', err));
};

Phase.prototype.logstream = function() {
  return this.device
    .logstream(this.options.logcat)
    .then(R.apply((stream, request) => {
      this.streamRequest = request;
      return stream;
    }));
};

Phase.prototype.setDeviceMetadata = function() {
  return Promise
    .resolve()
    .then(() => this.device.getGaiaRevision())
    .then(sha => this.gaiaRevision = sha)
    .then(() => this.device.getGeckoRevision())
    .then(sha => this.geckoRevision = sha)
    .then(() => this.device.getProperties())
    .then(props => this.properties = props);
};

/**
 * Attempt to perform a test run
 * @returns {Promise}
 */
Phase.prototype.tryRun = function() {
  return new Promise((resolve, reject) => {
    this.resetTimeout(() => reject(new Error('timeout')));
    this
      .testRun()
      .then(resolve)
      .catch(reject);
  });
};

/**
 * Before the next test run, reset the state of the phase and determine next
 * course of action, whether that be ending the test or starting the next run.
 * Resolves with function to handle continuation
 * @returns {Promise}
 */
Phase.prototype.beforeNext = function() {
  this.stopTimeout();
  this.log(`Run ${this.currentRun} complete`);
  this.runs.push(this.results);

  if (this.currentRun < this.options.runs) {
    // If we have more runs to do, notify the tester that the current run has
    // completed and pass a function which will start the next run...
    this.currentRun++;
    return Promise.resolve(() => this.test());
  }

  // ...otherwise notify the tester that the current run has completed and
  // pass a function which will end the test suite
  return Promise.resolve(() => {
    this.emit('end');
    this.removeAllListeners();
    this.dispatcher.end();
  });
};

/**
 * Cache a function to be called at every test run phase point
 * @param {Function} handler
 */
Phase.prototype.afterEach = function(handler) {
  this.afterEach.handlers.push(handler);
};

Phase.prototype.afterEach.handlers = [];

/**
 * Handler to be invoked when the current run is completed and ready for another
 * run or end of suite. Continuation is passed to the test itself for next
 * determination.
 */
Phase.prototype.next = function() {
  let promises = this.afterEach.handlers.map(handler => handler(this));

  Promise
    .all(promises)
    .then(() => this.handleRun())
    .then(() => this.beforeNext())
    .then(next => next())
    .catch(err => this.emit('error', err));
};

/**
 * Handle a test run failure by attempting any retries or notifying the test
 * phase of the failure
 * @param err
 */
Phase.prototype.fail = function(err) {
  this.stopTimeout();

  if (err.message && err.message === 'timeout') {
    if (this.currentTry <= this.options.retries) {
      this.log('Run %d timed out, retry attempt %d',
        this.currentRun, this.currentTry);
      this.currentTry++;

      // reset the timer and any potentially erroneous results
      this.resetTimeout();
      this.results = [];

      this.device
        .clearLog()
        .then(() => this.retry())
        .then(() => this.tryRun())
        .then(() => this.next())
        .catch(err => this.fail(err));
    } else {
      this.timeoutError();
    }
  } else {
    this.emit('error', err);
  }
};

/**
 * Start a single test run
 */
Phase.prototype.test = function() {
  this.currentTry = 1;
  this.log(`Starting run ${this.currentRun}`);
  this.results = [];

  this
    .tryRun()
    .then(() => this.next())
    .catch(err => this.fail(err));
};

/**
 * Input event will be ignored if the value equals to the kernel cached one.
 * Initiate a reset to set cached values 0 after a B2G restart. Check bug
 * 1168269 comment 22 for more information.
 * @returns {Promise}
 */
Phase.prototype.resetInput = function() {
  return this.device.resetInput();
};

/**
 * Start the suite by passing execution back to the phase for event binding and
 * test notifications
 */
Phase.prototype.start = function() {
  this.currentRun = 1;
  return this.test();
};

/**
 * Write the given entries to a format suitable for reporting
 * @param {Array} entries
 * @param {String} startMark
 * @returns {object}
 */
Phase.prototype.format = function(entries, startMark) {
  // Convert time to nanoseconds, then encode the current run into the
  // insignificant digits beyond the millisecond. This allows us to
  // aggregate runs together by millisecond in Grafana but still provide a
  // unique record to create in InfluxDB
  let time = this.options.time + this.zeroPad(this.currentRun);
  let points = [];
  let initialAction = null;
  let initialActionIndex = null;
  let testTags = R.merge({
    test: this.options.test,
    phase: this.name,
    revisionId: this.getRevisions().revisionId
  }, this.getDeviceTags());

  // Find the initialAction and its location in the entries
  entries.some((entry, index) => {
    if (entry.name !== startMark) {
      return false;
    }

    initialAction = entry;
    initialActionIndex = index;
    return true;
  });

  if (!initialAction) {
    this.emit('error', new Error('Missing initial entry mark for run'));
    return;
  }

  // Remove initialAction from the other entries to avoid another filtering
  entries.splice(initialActionIndex, 1);

  entries.forEach((entry) => {
    let seriesName = '';
    let value = 0;

    if (entry.entryType === 'mark') {
      seriesName = 'measure';
      value = entry.epoch - initialAction.epoch;
    } else {
      seriesName = entry.entryType;
      value = entry.value || entry.duration;
    }

    // Nothing should ever measure to be less than 0
    if (value < 0) {
      return;
    }

    let point = {
      key: seriesName,
      timestamp: time,
      fields: {
        value: value
      },
      tags: R.merge({
        metric: entry.name,
        context: entry.entryPoint ?
          entry.context + '@' + entry.entryPoint :
          entry.context
      }, testTags)
    };

    if (entry.epoch) {
      point.fields.epoch = new Value(entry.epoch, influent.type.INT64);
    }

    points.push(point);
  });

  // Only inject an annotation point during the first run
  if (this.currentRun === 1) {
    this.annotate();
  }

  this.formattedRuns.push(points);

  return points;
};

/**
 * Create a data point for a Grafana/InfluxDB annotation
 * @param {string} title
 * @param {string} text
 * @returns {{timestamp: string, key: string, fields: object, tags: object}}
 */
Phase.prototype.createAnnotationPoint = function fn(title, text) {
  if (!fn.id) {
    fn.id = 1;
  }

  return {
    timestamp: this.options.time + this.zeroPad(fn.id++),
    key: 'annotation',
    fields: { text: text },
    tags: R.merge({
      title: title,
      test: this.options.test
    }, this.getDeviceTags())
  };
};

/**
 * Fetch the formatted revisions and revision id for the current device
 * @returns {object}
 */
Phase.prototype.getRevisions = function fn() {
  if (fn.cache) {
    return fn.cache;
  }

  let hash = crypto.createHash('sha1');
  let gaia = this.gaiaRevision.substr(0, 16);
  let gecko = this.geckoRevision.substr(0, 16);

  hash.update(gaia);
  hash.update(gecko);

  fn.cache = {
    gaia: gaia,
    gecko: gecko,
    revisionId: hash.digest('hex')
  };

  return fn.cache;
};

/**
 * Report test metadata annotations
 * @returns {Promise}
 */
Phase.prototype.annotate = function() {
  let revisions = this.getRevisions();
  let gaia = this.createAnnotationPoint('Gaia', revisions.gaia);
  let gecko = this.createAnnotationPoint('Gecko', revisions.gecko);

  gaia.tags.revisionId = revisions.revisionId;
  gecko.tags.revisionId = revisions.revisionId;

  return this.report([gaia, gecko]);
};

/**
 * Output aggregate statistical information for all suite runs to the console
 */
Phase.prototype.calculateStats = function() {
  let results = {};
  let statistics = {};

  this.formattedRuns.forEach((run) => {
    run.forEach((point) => {
      // The key is the type of metric, e.g. measure, memory, ...
      let contextResults = results[point.tags.context];
      let metric = point.tags.metric;
      let value = point.fields.value;

      if (!contextResults) {
        contextResults = results[point.tags.context] = {};
      }

      if (!contextResults[metric]) {
        contextResults[metric] = [];
      }

      if (point.key === 'memory') {
        value = value / 1024 / 1024;
      }

      contextResults[metric].push(value);
    });
  });

  Object
    .keys(results)
    .forEach((contextKey) => {
      let contextResults = results[contextKey];

      statistics[contextKey] = [];

      Object
        .keys(contextResults)
        .forEach(function(key) {
          let values = contextResults[key];
          let mean = stats.mean(values);
          let stdev = stats.stdev(values);

          statistics[contextKey].push({
            Metric: key,
            Mean: mean,
            Median: stats.median(values),
            Min: Math.min.apply(Math, values),
            Max: Math.max.apply(Math, values),
            StdDev: stdev,
            '95% Bound': mean + (1.96 * stdev / Math.sqrt(values.length)) // eslint-disable-line
          });
        });
    });

  return statistics;
};

/**
 * Output aggregate statistical information for all suite runs to the console
 */
Phase.prototype.logStats = function(statistics) {
  if (this.options.output === 'json') {
    console.log(JSON.stringify(statistics));
    return;
  }

  Object
    .keys(statistics)
    .forEach((contextKey) => {
      let table = [];
      let metrics = statistics[contextKey];

      metrics.forEach((metric, index) => {
        let keys = Object.keys(metric);

        // Capture the table headers from the first record
        if (index === 0) {
          table.push(keys);
        }

        // Now push each row into the table
        table.push(keys.map((key) => {
          let value = metric[key];

          if (typeof value === 'number' && value % 1 !== 0) {
            value = value.toFixed(3);
          }

          return value;
        }));
      });

      this.log('Results from %s\n', contextKey);
      console.log(markdownTable(table) + '\n');
    }, this);
};

/**
 * Read device-specific tags from the device's properties
 * @returns {object}
 */
Phase.prototype.getDeviceTags = function() {
  if (this.getDeviceTags.cache) {
    return this.getDeviceTags.cache;
  }

  let properties = this.properties;
  let tags = {};

  Object
    .keys(properties)
    .forEach((key) => {
      if (key.indexOf(Phase.TAG_IDENTIFIER) === 0) {
        tags[key.slice(Phase.TAG_IDENTIFIER.length)] = properties[key];
      }
    });

  this.getDeviceTags.cache = tags;

  return this.getDeviceTags.cache;
};

/**
 * Write useful debug information about receiving an event entry
 * @param {string} event
 * @param {object} entry
 */
Phase.prototype.debugEventEntry = function(event, entry) {
  debug(`Received ${event} "${entry.name}" in ${entry.context}`);
};

/**
 * Wait for a particular performance mark or measure from a given context
 * @param {string} name performance entry name to wait for
 * @param {string} context origin which will emit the performance entry
 * @returns {Promise}
 */
Phase.prototype.waitForPerformanceEntry = function(name, context) {
  let phase = this;

  return new Promise((resolve) => {
    this.dispatcher.on(Phase.PERFORMANCEENTRY, function handler(entry) {
      if (entry.name !== name || entry.context !== context) {
        return;
      }

      phase.dispatcher.removeListener(Phase.PERFORMANCEENTRY, handler);
      resolve(entry);
    });
  });
};

/**
 * Wait for the USS, PSS, and RSS from a given context
 * @param {string} context origin which will emit the memory entries
 * @returns {Promise}
 */
Phase.prototype.waitForMemory = function(context) {
  let hasUss = false;
  let hasPss = false;
  let hasRss = false;
  let phase = this;

  return new Promise((resolve) => {
    this.dispatcher.on(Phase.MEMORYENTRY, function handler(entry) {
      if (entry.context !== context) {
        return;
      }

      if (entry.name === 'uss') {
        hasUss = true;
      } else if (entry.name === 'pss') {
        hasPss = true;
      } else if (entry.name === 'rss') {
        hasRss = true;
      }

      if (hasUss && hasPss && hasRss) {
        phase.dispatcher.removeListener(Phase.MEMORYENTRY, handler);
        resolve(entry);
      }
    });
  });
};

/**
 * Wait for the Homescreen and System to reach fullyLoaded
 * @returns {Promise}
 */
Phase.prototype.waitForB2GStart = function() {
  return Promise.all([
    this.waitForHomescreen(),
    this.waitForSystem()
  ]);
};

/**
 * Resolve when the Homescreen has been fully loaded
 * @returns {Promise}
 */
Phase.prototype.waitForHomescreen = function waiter() {
  debug('Waiting for Homescreen');

  if (this.homescreenFullyLoaded) {
    return Promise.resolve(waiter.entry);
  }

  return this
    .waitForPerformanceEntry('fullyLoaded', this.options.homescreen)
    .then((entry) => {
      this.homescreenFullyLoaded = true;

      if (!this.homescreenPid) {
        debug(`Capturing Homescreen PID: ${entry.pid}`);
        this.homescreenPid = entry.pid;
      }

      waiter.entry = entry;

      return waiter.entry;
    });
};

/**
 * Resolve when the System has been fully loaded
 * @returns {Promise}
 */
Phase.prototype.waitForSystem = function waiter() {
  debug('Waiting for System');

  if (this.systemFullyLoaded) {
    return Promise.resolve(waiter.entry);
  }

  return Promise
    .race([
      this.waitForPerformanceEntry('fullyLoaded', this.options.system),
      this.waitForPerformanceEntry('osLogoEnd', this.options.system)
    ])
    .then((entry) => {
      this.systemFullyLoaded = true;

      if (!this.systemPid) {
        debug(`Capturing System PID: ${entry.pid}`);
        this.systemPid = entry.pid;
      }

      waiter.entry = entry;

      return waiter.entry;
    });
};

/**
 * Trigger a memory minimization on the device
 * @returns {Promise}
 */
Phase.prototype.triggerGC = function() {
  let marionette = this.marionette;

  return marionette
    .startSession()
    .then(() => marionette.triggerGC())
    .then(() => marionette.deleteSession());
};

module.exports = Phase;
