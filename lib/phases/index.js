'use strict';

let fs = require('fs');
let path = require('path');
let utils = require('../utils');

/**
 * Factory to instantiate a phase based on the phase type, e.g. `cold`,
 * `reboot`, `restart-b2g`
 * @param {{
 *   phase: String
 * }} options
 * @returns {Phase}
 * @constructor
 */
module.exports.create = function(options) {
  let phasePath = options.phase;

  if (fs.existsSync(path.join(__dirname, phasePath + '.js'))) { // eslint-disable-line
    phasePath = './' + phasePath;
  } else {
    phasePath = utils.toAbsolute(phasePath);
  }

  let Phase = require(phasePath); // eslint-disable-line

  return new Phase(options);
};
