var Phase = require('./phase');
var util = require('util');
var Promise = require('promise');
var debug = require('debug')('raptor:coldlaunch');

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
var ColdLaunch = function(options) {
  if (!options.app) {
    throw new Error('--app is required for cold-launch phase');
  }

  this.title = 'Cold Launch: ' + options.app;

  Phase.call(this, options);

  var phase = this;

  /**
   * To prepare for a test run we need to:
   * 1. Clear the ADB log
   * 2. Restart B2G
   * 3. Wait for the Homescreen to load so we know when to be able to launch
   * 4. Prime the application to remove initial outlier
   * 5. Register to capture performance entries
   * 6. Start runs
   */

  this.getDevice()
    .then(function() {
      return phase.device.log.clear();
    })
    .then(function() {
      return phase.device.helpers.restartB2G();
    })
    .then(function() {
      return phase.waitForB2GStart();
    })
    .then(function() {
      return phase.getAppCoordinates();
    })
    .then(function() {
      return phase.prime();
    })
    .then(function() {
      return phase.capture();
    })
    .then(function() {
      return phase.start();
    });
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
  var phase = this;
  var app = this.options.app;
  var entryPoint = this.options.entryPoint;
  this.fullyLoaded = false;

  /**
   * Captured performance entries:
   * 1. performance.measures belonging to the tested app
   * 2. performance.mark for appLaunch
   * 3. performance.marks that occur at or before fullyLoaded as these are
   *    de facto performance.measures
   */
  this.dispatcher.on(Phase.PERFORMANCEENTRY, function(entry) {
    phase.debugEventEntry(Phase.PERFORMANCEENTRY, entry);

    var ignore = phase.fullyLoaded &&
        entry.entryType === 'mark' &&
        entry.name !== phase.START_MARK;

    if (ignore) {
      return;
    }

    if (entry.context !== app) {
      return;
    }

    if (entry.name === 'fullyLoaded') {
      phase.fullyLoaded = true;
    }

    if (entryPoint) {
      entry.entryPoint = entryPoint;
    }

    phase.results.push(entry);
  });

  /**
   * Captured memory entries:
   * All matching the tested app
   */
  this.dispatcher.on(Phase.MEMORYENTRY, function(entry) {
    phase.debugEventEntry(Phase.MEMORYENTRY, entry);

    if (entry.context !== app) {
      return;
    }

    if (entryPoint) {
      entry.entryPoint = entryPoint;
    }

    phase.results.push(entry);
  });
};

/**
 * Cache the PID of an application based on performance entry metadata
 * @param entry
 */
ColdLaunch.prototype.captureEntryMetadata = function(entry) {
  if (!this.appPid && entry.pid !== this.homescreenPid) {
    debug('Capturing application PID: %d', entry.pid);
    this.appPid = entry.pid;
  }
};

/**
 * Launch the application and resolve when it has fullyLoaded
 * @returns {Promise}
 */
ColdLaunch.prototype.launch = function() {
  var phase = this;

  if (this.options.launchDelay) {
    debug('Pausing before launching application');
  }

  this.resetInput();

  // Delay launch to give time for pre-allocated process and system cool-down
  setTimeout(function() {
    phase.device.input.tap(phase.appX, phase.appY, 1);
  }, this.options.launchDelay);

  return this.waitForPerformanceEntry('fullyLoaded', this.options.app);
};

/**
 * Cache coordinates to the target application
 * @returns {Promise}
 */
ColdLaunch.prototype.getAppCoordinates = function() {
  var phase = this;
  var marionette = phase.device.marionette;

  debug('Homescreen: ' + this.options.homescreen);

  var selector = this.options.homescreen === 'verticalhome.gaiamobile.org' ?
    '#icons > .icon[data-identifier*="' + this.options.app + '"]' :
    '#apps [data-identifier*="' + this.options.app + '"]';

  if (this.options.entryPoint) {
    selector += '[data-identifier*="' + this.options.entryPoint + '"]';
  }

  return marionette
    .startSession()
    .then(function(client) {
      client.switchToFrame();

      // Capture the full height of the System to determine how much shorter
      // the homescreen is
      var systemHeight = client.executeScript(function() {
        return window.wrappedJSObject.innerHeight; // eslint-disable-line
      });

      marionette.switchToHomescreen();

      var element = client.findElement(selector);

      // Scroll the app icon into view, then grab its coordinates
      var icon = element.scriptWith(function(el) {
        var win = window.wrappedJSObject; // eslint-disable-line
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
    .then(function(icon) {
      var dpx = icon.devicePixelRatio;
      var rect = icon.rect;
      var offset = Phase.ICON_TAP_OFFSET;

      phase.appX = Math.ceil((rect.left + offset) * dpx);
      phase.appY = Math.ceil((rect.top + offset + icon.systemOffset) * dpx);

      debug('Application coordinates: (X: %d, Y: %d)', phase.appX, phase.appY);
    });
};

/**
 * Prime application for cold-launch by starting the application and closing it,
 * causing it to do any introductory operations e.g. DB, IO, etc.
 * @returns {Promise}
 */
ColdLaunch.prototype.prime = function() {
  var phase = this;

  this.log('Priming application');

  return this
    .launch()
    .then(function(entry) {
      phase.captureEntryMetadata(entry);
      return phase.closeApp();
    });
};

/**
 * Occasionally clear the performance mark and measure buffer in the Homescreen
 * @returns {Promise}
 */
ColdLaunch.prototype.preventBufferOverflow = function() {
  if (this.launchesBuffered < Phase.PERFORMANCE_BUFFER_SAFETY) {
    return Promise.resolve();
  }

  var phase = this;
  var marionette = this.device.marionette;

  // Clear the performance buffer after a controlled number of app launches
  // to keep marking running smoothly, and to avoid hitting the maximum
  // buffer limit
  return marionette
    .startSession()
    .then(function() {
      marionette.switchToHomescreen();
      return marionette.clearPerformanceBuffer();
    })
    .then(function(client) {
      client.deleteSession();
      phase.launchesBuffered = 0;
    });
};

/**
 * Stand up an application cold launch for each individual test run. Will denote
 * the run has completed its work when the application is fully loaded and its
 * memory captured
 * @returns {Promise}
 */
ColdLaunch.prototype.testRun = function() {
  var phase = this;


  this
    .preventBufferOverflow()
    .then(function() {
      return phase.launch();
    })
    .then(function(entry) {
      phase.launchesBuffered++;
      phase.fullyLoaded = true;
      phase.captureEntryMetadata(entry);

      if (phase.options.memoryDelay) {
        debug('Pausing before capturing memory');
      }

      setTimeout(function() {
        phase
          .triggerGC()
          .then(function() {
            phase.device.log.memory(phase.appPid, entry.context);
          });
      }, phase.options.memoryDelay);
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

  var phase = this;

  return this.device.helpers
    .kill(this.appPid)
    .then(function() {
      phase.appPid = null;
    });
};

/**
 * Retry handler which is invoked if a test run fails to complete. For cold
 * launch, delete any outstanding Marionette session and close the app
 * @returns {Promise}
 */
ColdLaunch.prototype.retry = function() {
  var phase = this;

  // clear any outstanding listeners
  phase.dispatcher.removeAllListeners();

  return Promise
    .resolve()
    .then(function() {
      if (phase.device.marionette) {
        return phase.device.marionette.deleteSession();
      }
    })
    .then(function() {
      return phase.closeApp();
    })
    .then(function() {
      return phase.getAppCoordinates();
    })
    .then(function() {
      return phase.capture();
    });
};

/**
 * Report the results for an individual test run
 * @returns {Promise}
 */
ColdLaunch.prototype.handleRun = function() {
  this.fullyLoaded = false;
  this.report(this.format(this.results, this.START_MARK));
  return Promise.resolve();
};

module.exports = ColdLaunch;
