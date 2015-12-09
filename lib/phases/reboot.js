'use strict';

let debug = require('debug')('raptor:reboot');
let Dispatcher = require('../dispatcher');
let Marionette = require('../marionette');
let memoryParser = require('../parsers/memory');
let performanceParser = require('../parsers/performance');
let Phase = require('./phase');
let R = require('ramda');
let util = require('util');

/**
 * Create a phase which achieves a ready state when the device has been rebooted
 * @param {{
 *   runs: Number,
 *   timeout: Number,
 *   retries: Number
 * }} options
 * @constructor
 */
let Reboot = function(options) {
  // The connection to the dispatcher is ADB-based, so rebooting the device will
  // kill the ADB stream. Prevent the base phase from instantiating it so we
  // can control the dispatcher lifecycle
  options.preventDispatching = true; // eslint-disable-line

  Phase.call(this, options);
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
  if (this.streamRequest) {
    this.streamRequest.destroy();
  }

  return this
    .logstream()
    .then(stream => this.dispatcher = new Dispatcher(stream))
    .then(() => this.registerParser(performanceParser))
    .then(() => this.registerParser(memoryParser))
    .then(() => this.capture());
};

/**
 * Perform a device reboot/restart
 * @returns {Promise}
 */
Reboot.prototype.reboot = function() {
  let port = this.options.forwardPort || this.options.marionettePort;

  this.homescreenFullyLoaded = false;
  this.systemFullyLoaded = false;
  this.homescreenPid = null;
  this.systemPid = null;

  return this
    .getDevice()
    .then(device => device.clearLog())
    .then(() => this.startTime = Date.now())
    .then(() => this.restart())
    .then(() => this.setup())
    .then(() => this.device.mark(this.START_MARK, this.startTime))
    .then(() => this.device.adbForward(port))
    .then(port => this.marionette = new Marionette(R.merge(this.options, { port })));
};

/**
 * Perform the action necessary to reboot or restart the phase state
 * @returns {Promise}
 * @private
 */
Reboot.prototype.restart = function() {
  return this.device.reboot();
};

/**
 * Create event listeners for performance and memory entries which determine
 * whether we store the entry as pertinent to the test run
 */
Reboot.prototype.capture = function() {
  let entryPoint = this.options.entryPoint;

  /**
   * Captured performance entries:
   * 1. Any performance.measures
   * 2. mark for phase start (this.START_MARK)
   * 3. performance.marks that occur at or before fullyLoaded or Homescreen and
   *    System as these are de facto performance.measures
   */
  this.dispatcher.on(Phase.PERFORMANCEENTRY, (entry) => {
    let name = entry.name;
    let ignore = this.homescreenFullyLoaded &&
        this.systemFullyLoaded &&
        entry.entryType === 'mark' &&
        entry.name !== this.START_MARK;

    // Due to a bug in a device's ability to keep consistent time after
    // a reboot, we are currently overriding the time of entries. Not
    // very accurate, but it's better than nothing. :/
    entry.epoch = name === this.START_MARK ? this.startTime : Date.now(); // eslint-disable-line
    this.debugEventEntry(Phase.PERFORMANCEENTRY, entry);

    if (ignore) {
      return;
    }

    if (entryPoint) {
      entry.entryPoint = entryPoint; // eslint-disable-line
    }

    this.results.push(entry);
  });

  /**
   * Captured memory entries: All
   */
  this.dispatcher.on(Phase.MEMORYENTRY, (entry) => {
    this.debugEventEntry(Phase.MEMORYENTRY, entry);

    if (entryPoint) {
      entry.entryPoint = entryPoint; // eslint-disable-line
    }

    this.results.push(entry);
  });
};


/**
 * Stand up a device reboot for each individual test run. Will denote the run
 * has completed its work when the System marks the end of the logo screen.
 * @returns {Promise}
 */
Reboot.prototype.testRun = function() {
  let homescreen = this.options.homescreen;
  let system = this.options.system;

  return this
    .reboot()
    .then(() => this.waitForB2GStart())
    .then(() => {
      let promises = Promise.all([
        this.waitForMemory(homescreen),
        this.waitForMemory(system)
      ]);

      if (this.options.memoryDelay) {
        debug('Pausing before capturing memory');
      }

      setTimeout(() => {
        this
          .triggerGC()
          .then(() => this.device.markMemory(this.homescreenPid, homescreen))
          .then(() => this.device.markMemory(this.systemPid, system));
      }, this.options.memoryDelay);

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
  return this.report(this.format(this.results, this.START_MARK));
};

module.exports = Reboot;
