'use strict';

let parser = require('./parser');
let url = require('url');

const TOKEN = 'PerformanceTiming';
const OLD_TOKEN = 'Performance Entry: ';

/**
 * Determine whether a log entry is one for performance marks and measures
 * @param {object} item ADB log entry
 * @returns {boolean}
 */
let matcher = item => item.tag === TOKEN;

/**
 * Parse an ADB log entry and extract the performance metadata
 * @param {object} item ADB log entry
 * @returns {{
 *   entryType: String,
 *   name: String,
 *   context: String,
 *   startTime: Number,
 *   duration: Number,
 *   epoch: Number,
 *   pid: String
 * }}
 */
let parse = (item) => {
  let parts = item.message
    .replace(OLD_TOKEN, '')
    .split('|');
  let name = parts[2].split('@');
  let context = parts[0];

  if (name[1]) {
    context = url.parse(name[1]).host || name[1];
  }

  return {
    context: context,
    entryType: parts[1],
    name: name[0],
    startTime: parseFloat(parts[3]),
    duration: parseFloat(parts[4]),
    epoch: parseFloat(parts[5]),
    pid: item.pid
  };
};

module.exports = parser('performanceentry', matcher, parse);
