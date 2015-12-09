'use strict';

let parser = require('./parser');
let R = require('ramda');

const TOKEN = 'PerformanceMemory';

/**
 * Determine whether a log entry is one for an application's memory entry
 * @param {object} item ADB log entry
 * @returns {boolean}
 */
let matcher = item => item.tag === TOKEN;

/**
 * Parse an ADB log entry and extract an application's memory entry
 * @param {object} item ADB log entry
 * @returns {{context: String, name: String, value: Number, entryType: String}}
 */
var parse = (item) => {
  let parts = R.split('|', item.message);

  return {
    context: parts[0],
    name: parts[1],
    value: parseFloat(parts[2]) * 1024 * 1024,
    entryType: 'memory'
  };
};

module.exports = parser('memoryentry', matcher, parse);
