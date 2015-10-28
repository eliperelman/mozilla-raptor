var Phase = require('./phase');
var Dispatcher = require('../dispatcher');
var Promise = require('promise');
var util = require('util');
var performanceParser = require('../parsers/performance');
var memoryParser = require('../parsers/memory');
var debug = require('debug')('raptor:reboot');

/**
 * Create a phase which achieves a ready state when the device has been rebooted
 * @param {{
 *   runs: Number,
 *   timeout: Number,
 *   retries: Number
 * }} options
 * @constructor
 */
var Reboot = function(options) {
  // The connection to the dispatcher is ADB-based, so rebooting the device will
  // kill the ADB stream. Prevent the base phase from instantiating it so we
  // can control the dispatcher lifecycle
  var opts = options;

  opts.preventDispatching = true;

  Phase.call(this, opts);
  this.start();
};

util.inherits(Reboot, Phase);

Reboot.prototype.title = 'Reboot';
Reboot.prototype.name = 'reboot';
Reboot.prototype.START_MARK = 'deviceReboot';

/**
 * Manually instantiate a Dispatcher and listen for performance entries
 */
Reboot.prototype.setup = function() {
  this.device.log.restart();
  this.dispatcher = new Dispatcher(this.device);
  this.registerParser(performanceParser);
  this.registerParser(memoryParser);
  this.capture();
};

/**
 * Perform a device reboot/restart
 * @returns {Promise}
 */
Reboot.prototype.reboot = function() {
  var phase = this;

  this.homescreenFullyLoaded = false;
  this.systemFullyLoaded = false;
  this.homescreenPid = null;
  this.systemPid = null;

  return this.getDevice()
    .then(function() {
      return phase.device.log.clear();
    })
    .then(function() {
      phase.start = Date.now();
      return phase.restart();
    })
    .then(function(time) {
      phase.setup();
      return phase.device.log.mark(phase.START_MARK, time);
    })
    .then(function() {
      return phase.device
        .adbForward(phase.options.forwardPort || phase.options.marionettePort);
    });
};

/**
 * Perform the action necessary to reboot or restart the phase state
 * @returns {Promise}
 * @private
 */
Reboot.prototype.restart = function() {
  return this.device.helpers.reboot();
};

/**
 * Create event listeners for performance and memory entries which determine
 * whether we store the entry as pertinent to the test run
 */
Reboot.prototype.capture = function() {
  var phase = this;
  var entryPoint = this.options.entryPoint;

  /**
   * Captured performance entries:
   * 1. Any performance.measures
   * 2. mark for phase start (this.START_MARK)
   * 3. performance.marks that occur at or before fullyLoaded or Homescreen and
   *    System as these are de facto performance.measures
   */
  this.dispatcher.on(Phase.PERFORMANCEENTRY, function(entry) {
    var name = entry.name;
    var entryOut = entry;
    var ignore = phase.homescreenFullyLoaded &&
        phase.systemFullyLoaded &&
        entry.entryType === 'mark' &&
        entry.name !== phase.START_MARK;

    // Due to a bug in a device's ability to keep consistent time after
    // a reboot, we are currently overriding the time of entries. Not
    // very accurate, but it's better than nothing. :/
    entryOut.epoch = name === phase.START_MARK ? phase.start : Date.now();

    phase.debugEventEntry(Phase.PERFORMANCEENTRY, entryOut);

    if (ignore) {
      return;
    }

    if (entryPoint) {
      entryOut.entryPoint = entryPoint;
    }

    phase.results.push(entryOut);
  });

  /**
   * Captured memory entries: All
   */
  this.dispatcher.on(Phase.MEMORYENTRY, function(entry) {
    phase.debugEventEntry(Phase.MEMORYENTRY, entry);

    var entryOut = entry;

    if (entryPoint) {
      entryOut.entryPoint = entryPoint;
    }

    phase.results.push(entryOut);
  });
};


/**
 * Stand up a device reboot for each individual test run. Will denote the run
 * has completed its work when the System marks the end of the logo screen.
 * @returns {Promise}
 */
Reboot.prototype.testRun = function() {
  var phase = this;

  return this
    .reboot()
    .then(function() {
      return phase.waitForB2GStart();
    })
    .then(function() {
      var log = phase.device.log;
      var promises = Promise.all([
        phase.waitForMemory(phase.options.homescreen),
        phase.waitForMemory(phase.options.system)
      ]);

      if (phase.options.memoryDelay) {
        debug('Pausing before capturing memory');
      }

      setTimeout(function() {
        phase
          .triggerGC()
          .then(function() {
            log.memory(phase.homescreenPid, phase.options.homescreen);
            log.memory(phase.systemPid, phase.options.system);
          });
      }, phase.options.memoryDelay);

      return promises;
    });
};

/**
 * Retry handler which is invoked if a test run fails to complete. Currently
 * does nothing to handle a retry.
 * @returns {Promise}
 */
Reboot.prototype.retry = Phase.NOOP;

/**
 * Report the results for an individual test run
 * @returns {Promise}
 */
Reboot.prototype.handleRun = function() {
  this.report(this.format(this.results, this.START_MARK));
  return Promise.resolve();
};

module.exports = Reboot;
