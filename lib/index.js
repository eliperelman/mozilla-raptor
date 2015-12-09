'use strict';

let phases = require('./phases');
let R = require('ramda');

// Each test run can generate many event handlers, so let's shut off Node's
// too-many-listeners warning.
process.setMaxListeners(Infinity);

/**
 * Factory function to generate promisified-safe function invoker
 * @returns {Function}
 */
let factory = () => {
  let instance = (handler) => instance.handler = handler;

  instance.invoke = function() {
    return Promise
      .resolve()
      .then(() => {
        if (instance.handler) {
          return instance.handler.apply(null, arguments);
        }
      });
  };

  return instance;
};

/**
 * Define the following members as global functions for test-writing magic
 */
R.map(method => global[method] = factory(), ['setup', 'afterEach', 'teardown']);

/**
 * Pass or fail, we still have to teardown the tests
 * @param phase
 */
var complete = function(phase) {
  phase.log('Testing complete');
  return global.teardown.invoke(phase);
};

/**
 * Report error to the console and exit
 */
let handleError = function(phase, err) {
  if (phase) {
    phase.log('Aborted due to error:\n');
  }

  console.error(err.stack || err);
  process.emit('complete');
  process.exit(1);
};

/**
 * Listen for test end or errors and output them
 */
let listen = (phase) => {
  phase.once('error', err => complete(phase).then(() => handleError(phase, err)));
  phase.once('end', R.pipe(
    R.bind(phase.calculateStats, phase),
    R.bind(phase.logStats, phase),
    () => complete(phase).then(() => process.emit('complete'))
  ));
};

module.exports = (options) => {
  // Here we officially require the test file
  require(options.nameOrPath); // eslint-disable-line

  return global
    .setup
    .invoke(options)
    .then(() => phases.create(options))
    .then(R.tap(listen))
    .then(phase => phase.afterEach(global.afterEach.invoke))
    .catch(err => handleError(null, err));
};
