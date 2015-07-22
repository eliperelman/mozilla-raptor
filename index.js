var Promise = require('promise');
var utils = require('./utils');
var phases = require('./lib/phases');
var database = require('./lib/reporter/database');

// Each test run can generate many event handlers, so let's shut off Node's
// too-many-listeners warning.
process.setMaxListeners(Infinity);

/**
 * Factory function to generate promisified-safe function invoker
 * @returns {Function}
 */
var factory = function() {
  var instance = function(handler) {
    instance._handler = handler;
  };

  instance.invoke = function() {
    var args = arguments;

    return Promise
      .resolve()
      .then(function() {
        if (instance._handler) {
          return instance._handler.apply(null, args);
        }
      });
  };

  return instance;
};

/**
 * Define the following members as global functions for test-writing magic
 */
['setup', 'afterEach', 'teardown'].forEach(function(method) {
  global[method] = factory();
});

/**
 * Handle any remaining logic after all suites have been completed
 */
var complete = function(phase) {
  phase.log('Testing complete');

  if (!phase.device) {
    return Promise.resolve();
  }

  return phase
    .reportTest()
    .then(function() {
      return phase.device.log.stop();
    })
    .then(function() {
      return global.teardown.invoke(phase);
    });
};

/**
 * Report error to the console and exit
 */
var handleError = function(phase, err) {
  if (phase) {
    phase.log('Aborted due to error:\n');
  }

  console.error(err.stack || err);
  process.exit(1);
};

/**
 *
 * @param {object} options phases options, e.g. appPath, runs, retries
 * @param {function} callback
 */
var raptor = function(options) {
  // If registering a new runner: { phase: String, path: ModulePath }.
  // If registering a new runner there is no need to add 'phase' in options.
  if (options.runner) {
    var phase = options.runner.phase;
    var path = options.runner.path;

    phases.register(phase, path);
    options.phase = options.runner.phase;
  }

  // Here we officially require the test file
  require(options.nameOrPath);

  /**
   * 1. Call the test file's global `setup` function
   * 2. Instantiate the phase
   * 3. Bind handlers for errors or test end
   * 4. Call the test file's global `afterEach` function between runs
   */
  return global.setup
    .invoke(options)
    .then(function() {
      var phase = phases.create(options);

      phase.once('error', function(err) {
        return complete(phase)
          .then(function() {
            handleError(phase, err);
          });
      });

      phase.once('end', function() {
        phase.logStats();
        return complete(phase);
      });

      phase.afterEach(global.afterEach.invoke);
    })
    .catch(function(err) {
      handleError(null, err);
    });
};

/**
 * Export raptor for usage in modules other than bin/raptor
 * @type {Function}
 * @returns {Promise}
 */
module.exports = raptor;

/**
 * Submit a Raptor JSON log file to the database reporter
 * @param {object} options
 * @returns {Promise}
 */
module.exports.report = function(options) {
  if (!options.database) {
    handleError(null, new Error('--database is required for data submission'));
  }

  var report = database(options);

  return utils
    .readLog(options.log)
    .then(function(data) {
      return Promise.all(data.map(report));
    })
    .catch(function(err) {
      handleError(null, err);
    });
};
