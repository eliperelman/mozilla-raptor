'use strict';

let Phase = require('./phase');
let util = require('util');
let debug = require('debug')('raptor:coldlaunch');

/**
 * Create a suite phase which achieves a ready state when an application is
 * cold-launched, e.g. from a new process
 * @param {{
 *   appPath: String,
 *   runs: Number,
 *   timeout: Number,
 *   retries: Number
 * }} options
 * @constructor
 */
let ColdLaunch = function(options) {
  if (!options.app) {
    throw new Error('--app is required for cold-launch phase');
  }

  this.title = 'Cold Launch: ' + options.app;

  Phase.call(this, options);

  /**
   * To prepare for a test run we need to:
   * 1. Clear the ADB log
   * 2. Restart B2G
   * 3. Wait for the Homescreen to load so we know when to be able to launch
   * 4. Prime the application to remove initial outlier
   * 5. Register to capture performance entries
   * 6. Start runs
   */
  this
    .getDevice()
    .then(() => this.device.clearLog())
    .then(() => this.device.restartB2G())
    .then(() => this.waitForB2GStart())
    .then(() => this.getAppCoordinates())
    .then(() => this.prime())
    .then(() => this.capture())
    .then(() => this.start());
};

util.inherits(ColdLaunch, Phase);

ColdLaunch.prototype.title = 'Cold Launch';
ColdLaunch.prototype.name = 'coldlaunch';
ColdLaunch.prototype.START_MARK = 'appLaunch';
ColdLaunch.prototype.launchesBuffered = 0;

/**
 * Create event listeners for performance and memory entries which determine
 * whether we store the entry as pertinent to the test run
 */
ColdLaunch.prototype.capture = function() {
  let app = this.options.app;
  let entryPoint = this.options.entryPoint;

  this.fullyLoaded = false;

  /**
   * Captured performance entries:
   * 1. performance.measures belonging to the tested app
   * 2. performance.mark for appLaunch
   * 3. performance.marks that occur at or before fullyLoaded as these are
   *    de facto performance.measures
   */
  this.dispatcher.on(Phase.PERFORMANCEENTRY, (entry) => {
    this.debugEventEntry(Phase.PERFORMANCEENTRY, entry);

    let ignore = this.fullyLoaded &&
        entry.entryType === 'mark' &&
        entry.name !== this.START_MARK;

    if (ignore) {
      return;
    }

    if (entry.context !== app) {
      return;
    }

    if (entry.name === 'fullyLoaded') {
      this.fullyLoaded = true;
    }

    if (entryPoint) {
      entry.entryPoint = entryPoint; // eslint-disable-line
    }

    this.results.push(entry);
  });

  /**
   * Captured memory entries:
   * All matching the tested app
   */
  this.dispatcher.on(Phase.MEMORYENTRY, (entry) => {
    this.debugEventEntry(Phase.MEMORYENTRY, entry);

    if (entry.context !== app) {
      return;
    }

    if (entryPoint) {
      entry.entryPoint = entryPoint; // eslint-disable-line
    }

    this.results.push(entry);
  });
};

/**
 * Cache the PID of an application based on performance entry metadata
 * @param entry
 */
ColdLaunch.prototype.captureEntryMetadata = function(entry) {
  if (!this.appPid && entry.pid !== this.homescreenPid) {
    debug(`Capturing application PID: ${entry.pid}`);
    this.appPid = entry.pid;
  }
};

/**
 * Launch the application and resolve when it has fullyLoaded
 * @returns {Promise}
 */
ColdLaunch.prototype.launch = function() {
  if (this.options.launchDelay) {
    debug('Pausing before launching application');
  }

  this.resetInput();

  // Delay launch to give time for pre-allocated process and system cool-down
  setTimeout(() => this.device.tap(this.appX, this.appY), this.options.launchDelay);

  return this.waitForPerformanceEntry('fullyLoaded', this.options.app);
};

/**
 * Cache coordinates to the target application
 * @returns {Promise}
 */
ColdLaunch.prototype.getAppCoordinates = function() {
  let marionette = this.marionette;

  debug(`Homescreen: ${this.options.homescreen}`);

  let selector = this.options.homescreen === 'verticalhome.gaiamobile.org' ?
    '#icons > .icon[data-identifier*="' + this.options.app + '"]' :
    '#apps [data-identifier*="' + this.options.app + '"]';

  if (this.options.entryPoint) {
    selector += '[data-identifier*="' + this.options.entryPoint + '"]';
  }

  return marionette
    .startSession()
    .then((client) => {
      client.switchToFrame();

      // Capture the full height of the System to determine how much shorter
      // the homescreen is
      let systemHeight = client.executeScript(function() {
        return window.wrappedJSObject.innerHeight; // eslint-disable-line
      });

      marionette.switchToHomescreen();

      let element = client.findElement(selector);

      // Scroll the app icon into view, then grab its coordinates
      let icon = element.scriptWith(function(el) {
        let win = window.wrappedJSObject; // eslint-disable-line
        el.scrollIntoView(false);

        return {
          rect: el.getBoundingClientRect(),
          homescreenHeight: win.innerHeight,
          devicePixelRatio: win.devicePixelRatio
        };
      });

      // We need the difference between the System and Homescreen to determine
      // how much further down the page to tap, accounts for status bar
      icon.systemOffset = systemHeight - icon.homescreenHeight;
      client.deleteSession();

      return icon;
    })
    .then((icon) => {
      let dpx = icon.devicePixelRatio;
      let rect = icon.rect;
      let offset = Phase.ICON_TAP_OFFSET;

      this.appX = Math.ceil((rect.left + offset) * dpx);
      this.appY = Math.ceil((rect.top + offset + icon.systemOffset) * dpx);

      debug(`Application coordinates: (X: ${this.appX}, Y: ${this.appY})`);
    });
};

/**
 * Prime application for cold-launch by starting the application and closing it,
 * causing it to do any introductory operations e.g. DB, IO, etc.
 * @returns {Promise}
 */
ColdLaunch.prototype.prime = function() {
  this.log('Priming application');

  return this
    .launch()
    .then(entry => this.captureEntryMetadata(entry))
    .then(() => this.closeApp());
};

/**
 * Occasionally clear the performance mark and measure buffer in the Homescreen
 * @returns {Promise}
 */
ColdLaunch.prototype.preventBufferOverflow = function() {
  if (this.launchesBuffered < Phase.PERFORMANCE_BUFFER_SAFETY) {
    return Promise.resolve();
  }

  let marionette = this.marionette;

  // Clear the performance buffer after a controlled number of app launches
  // to keep marking running smoothly, and to avoid hitting the maximum
  // buffer limit
  return marionette
    .startSession()
    .then(() => marionette.switchToHomescreen())
    .then(() => marionette.clearPerformanceBuffer())
    .then(client => client.deleteSession())
    .then(() => this.launchesBuffered = 0);
};

/**
 * Stand up an application cold launch for each individual test run. Will denote
 * the run has completed its work when the application is fully loaded and its
 * memory captured
 * @returns {Promise}
 */
ColdLaunch.prototype.testRun = function() {
  this
    .preventBufferOverflow()
    .then(() => this.launch())
    .then(entry => {
      this.launchesBuffered++;
      this.fullyLoaded = true;
      this.captureEntryMetadata(entry);

      if (this.options.memoryDelay) {
        debug('Pausing before capturing memory');
      }

      setTimeout(() => {
        this
          .triggerGC()
          .then(() => this.device.markMemory(this.appPid, entry.context));
      }, this.options.memoryDelay);
    });

  return this.waitForMemory(this.options.app);
};

/**
 * Close the currently launched application if it is open
 * @returns {Promise}
 */
ColdLaunch.prototype.closeApp = function() {
  if (!this.appPid) {
    return Promise.resolve(null);
  }

  return this.device
    .kill(this.appPid)
    .then(() => this.appPid = null);
};

/**
 * Retry handler which is invoked if a test run fails to complete. For cold
 * launch, delete any outstanding Marionette session and close the app
 * @returns {Promise}
 */
ColdLaunch.prototype.retry = function() {
  // clear any outstanding listeners
  this.dispatcher.removeAllListeners();

  return Promise
    .resolve()
    .then(() => {
      if (this.marionette) {
        return this.marionette.deleteSession();
      }
    })
    .then(() => this.closeApp())
    .then(() => this.getAppCoordinates())
    .then(() => this.capture());
};

/**
 * Report the results for an individual test run
 * @returns {Promise}
 */
ColdLaunch.prototype.handleRun = function() {
  this.fullyLoaded = false;
  return this.report(this.format(this.results, this.START_MARK));
};

module.exports = ColdLaunch;
