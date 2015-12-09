var debug = require('debug')('raptor:marionette');
var marionetteApps = require('marionette-apps');
var marionetteClient = require('marionette-client');
var marionetteContentScript = require('marionette-content-script');
var marionetteFileManager = require('marionette-file-manager');
var marionetteHelper = require('marionette-helper');
var marionettePluginForms = require('marionette-plugin-forms');
var marionetteSettingsApi = require('marionette-settings-api');

var Client = marionetteClient.Client;
var Driver = marionetteClient.Drivers.TcpSync; // eslint-disable-line
var plugins = {
  apps: marionetteApps,
  contentScript: marionetteContentScript,
  fileManager: marionetteFileManager,
  forms: marionettePluginForms,
  helper: marionetteHelper,
  settings: marionetteSettingsApi
};

var promisifyCallback = function(resolve, reject) {
  return function(err) {
    if (err) {
      return reject();
    }

    return resolve();
  };
};

var HOMESCREEN_FRAME_SELECTOR = '#homescreen iframe';

/**
 * Instantiate a Marionette.js TcpSync Driver and Client
 * @param {Object} options options to generate Marionette client and driver
 * @constructor
 */
var Marionette = function(options) {
  this.host = options.marionetteHost;
  this.port = options.port || options.marionettePort;
  this.timeout = options.connectionTimeout;
  this.scriptTimeout = options.scriptTimeout;

  var client = this.client = new Client(null, {
    lazy: true
  });

  Object
    .keys(plugins)
    .forEach(function(key) {
      client.plugin(key, plugins[key]);
    });
};

/**
 * Start a Marionette.js client session; promise receives a marionette client
 * @returns {Promise.<marionetteClient.Client>}
 */
Marionette.prototype.startSession = function() {
  debug('[Creating driver] %s:%d with %dms connection timeout',
    this.host, this.port, this.timeout);

  var client = this.client;
  var driver = this.driver = new Driver({
    host: this.host,
    port: this.port,
    connectionTimeout: this.timeout
  });

  return new Promise(function(resolve) {
    /**
     * 1. Connect the Marionette TcpSync driver
     * 2. Create a marionette client from the driver
     * 3. Attach the plugins to the client
     * 4. Call client.startSession and resolve with client
     */
    driver.connect(function(err) {
      if (err) {
        debug(err);
      }

      client.resetWithDriver(driver);
      client.startSession(function() {
        resolve(client);
      });
    });
  });
};

/**
 * Switch to the homescreen iframe
 * Prerequisite: must be in marionette client session
 */
Marionette.prototype.switchToHomescreen = function() {
  this.client.switchToFrame();
  this.client.switchToFrame(this.client.findElement(HOMESCREEN_FRAME_SELECTOR));
};

/**
 * Force platform to perform memory minimization, resolving when finished
 * Prerequisite: must be in marionette client session
 * @returns {Promise}
 */
Marionette.prototype.triggerGC = function() {
  var client = this.client;
  var scriptTimeout = this.scriptTimeout;

  debug('Triggering memory minimization');

  return new Promise(function(resolve, reject) {
    client.switchToFrame();
    client.setScriptTimeout(scriptTimeout);

    client
      .scope({ context: 'chrome' })
      .executeAsyncScript(function() {
        var Cu = Components.utils; // eslint-disable-line
        var Cc = Components.classes; // eslint-disable-line
        var Ci = Components.interfaces; // eslint-disable-line

        Cu.import('resource://gre/modules/Services.jsm');
        Services.obs.notifyObservers(null, 'child-mmu-request', null); // eslint-disable-line

        var memoryManagerService = Cc['@mozilla.org/memory-reporter-manager;1']
          .getService(Ci.nsIMemoryReporterManager);

        memoryManagerService.minimizeMemoryUsage(marionetteScriptFinished); // eslint-disable-line
      }, promisifyCallback(resolve, reject));
  });
};

/**
 * Remove all performance marks and measures in the current frame
 * @returns {Promise}
 */
Marionette.prototype.clearPerformanceBuffer = function() {
  var client = this.client;

  debug('Clearing performance entries buffer');

  return new Promise(function(resolve) {
    client.executeScript(function() {
      var performance = window.wrappedJSObject.performance; // eslint-disable-line

      performance.clearMarks();
      performance.clearMeasures();
    });

    resolve(client);
  });
};

/**
 * Delete the current Marionette client session, ensuring client & driver state
 * @returns {Promise}
 */
Marionette.prototype.deleteSession = function() {
  var client = this.client;

  if (!client || !this.driver) {
    return Promise.resolve();
  }

  return new Promise(function(resolve, reject) {
    client.deleteSession(promisifyCallback(resolve, reject));
  });
};

module.exports = Marionette;
