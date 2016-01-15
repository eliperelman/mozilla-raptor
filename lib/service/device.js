'use strict';

let byline = require('byline');
let debug = require('debug')('raptor:device-service');
let fetch = require('./fetch');
let fs = require('fs');
let http = require('http');
let R = require('ramda');
let xRegExp = require('xregexp').XRegExp;

const FIELDS = ['level', 'timestamp', 'pid', 'tid', 'tag', 'message'];
const PATTERNS = {
  brief: xRegExp('^(?<level>[VDIWEAF])\\/(?<tag>[^)]{0,23}?)\\(\\s*(?<pid>\\d+)\\):\\s(?<message>.*)$'),
  threadtime: xRegExp('^(?<timestamp>\\d\\d-\\d\\d\\s\\d\\d:\\d\\d:\\d\\d\\.\\d+)\\s*(?<pid>\\d+)\\s*(?<tid>\\d+)\\s(?<level>[VDIWEAF])\\s(?<tag>.*?):\\s(?<message>.*)$'),
  time: xRegExp('^(?<timestamp>\\d\\d-\\d\\d\\s\\d\\d:\\d\\d:\\d\\d\\.\\d+):*\\s(?<level>[VDIWEAF])\\/(?<tag>.*?)\\((?<pid>\\s*\\d+)\\):\\s(?<message>.*)$'),
  process: xRegExp('^(?<level>[VDIWEAF])\\(\\s*(?<pid>\\d+)\\)\\s(?<message>.*)$'),
  tag: xRegExp('^(?<level>[VDIWEAF])\\/(?<tag>[^)]{0,23}?):\\s(?<message>.*)$'),
  thread: xRegExp('^(?<level>[VDIWEAF])\\(\\s*(?<pid>\\d+):(?<tid>0x.*?)\\)\\s(?<message>.*)$'),
  ddms_save: xRegExp('^(?<timestamp>\\d\\d-\\d\\d\\s\\d\\d:\\d\\d:\\d\\d\\.\\d+):*\\s(?<level>VERBOSE|DEBUG|ERROR|WARN|INFO|ASSERT)\\/(?<tag>.*?)\\((?<pid>\\s*\\d+)\\):\\s(?<message>.*)$')  // eslint-disable-line
};

/**
 * For a given line in a logcat message, determine the type of the line
 * This method adapted from the logcat-parse npm library, and is copyrighted by
 * its respective author, license located at
 * https://raw.githubusercontent.com/mcginty/logcat-parse/master/LICENSE
 * @param {string} line
 * @returns {string|null}
 */
var getLogMessageType = (line) => R.find(type => PATTERNS[type].test(line), R.keys(PATTERNS));

/**
 * Parse the contents of a logcat entry into a usable object
 * This method adapted from the logcat-parse npm library, and is copyrighted by
 * its respective author, license located at
 * https://raw.githubusercontent.com/mcginty/logcat-parse/master/LICENSE
 * @param {String} line
 * @returns {*}
 */
let parse = (line) => {
  // Strip any whitespace at the end
  let stripped = line.replace(/\s+$/g);
  let type = getLogMessageType(stripped);

  if (!type || !stripped.length) {
    return;
  }

  let message = {};
  let regex = PATTERNS[type];

  try {
    let match = xRegExp.exec(stripped, regex);
    let captureNames = regex.xregexp.captureNames;

    R.forEach(field => {
      if (captureNames.indexOf(field) >= 0) {
        message[field] = match[field];
      }
    }, FIELDS);

    return message;
  } catch (e) {} // eslint-disable-line
};

let capture = (stream) => {
  stream.on('data', data => {
    let message = parse(data.toString());

    message && stream.emit('entry', message);
  });
};

let Device = function(url) {
  this.url = url;
};

Device.prototype.request = function(method, endpoint) {
  debug(`[Requesting] ${method} ${this.url}${endpoint}`);
  return fetch(method, `${this.url}${endpoint}`);
};

Device.prototype.get = function(endpoint) {
  return this
    .request('GET', endpoint)
    .end()
    .then(response => response.body);
};

Device.prototype.restartB2G = function() {
  return this.request('POST', '/restart').end();
};

Device.prototype.reboot = function() {
  return this.request('POST', '/restart?hard=true').end();
};

Device.prototype.clearLog = function() {
  return this.request('DELETE', '/logs').end();
};

Device.prototype.mark = function(name, time) {
  return this
    .request('POST', '/logs')
    .send({
      message: `system.gaiamobile.org|mark|${name}|0|0|${time}`,
      priority: 'i',
      tag: 'PerformanceTiming'
    })
    .end();
};

Device.prototype.logMemory = function(context, type, value) {
  return this
    .request('POST', '/logs')
    .send({
      message: `${context}|${type}|${value}`,
      tag: 'PerformanceMemory',
      priority: 'i'
    })
    .end();
};

Device.prototype.markMemory = function(pid, context) {
  return this
    .get(`/processes/${pid}`)
    .then(process => {
      this.logMemory(context, 'uss', process.uss);
      this.logMemory(context, 'pss', process.pss);
      this.logMemory(context, 'rss', process.rss);
    });
};

Device.prototype.kill = function(pid) {
  return this
    .request('DELETE', `/processes/${pid}`)
    .end();
};

Device.prototype.resetInput = function() {
  return this.request('POST', '/events/reset').end();
};

Device.prototype.getGaiaRevision = function fn() {
  return fn.cache ?
    Promise.resolve(fn.cache) :
    this
      .get('/')
      .then(data => {
        fn.cache = data.gaia.sha;
        debug(`Gaia revision: ${fn.cache}`);
        return fn.cache;
      });
};

Device.prototype.getGeckoRevision = function fn() {
  return fn.cache ?
    Promise.resolve(fn.cache) :
    this
      .get('/')
      .then(data => {
        fn.cache = data.gecko;
        debug(`Gecko revision: ${fn.cache}`);
        return fn.cache;
      });
};

Device.prototype.getProperties = function() {
  return this.get('/properties');
};

Device.prototype.tap = function(x, y) {
  return this
    .request('POST', '/events/tap')
    .send({ x, y })
    .end();
};

Device.prototype.adbForward = function(remotePort) {
  return this
    .request('POST', `/connections/${remotePort}`)
    .end()
    .then(response => +response.text);
};

Device.prototype.logstream = function(destination) {
  debug(`Initializing log stream`);

  return new Promise((resolve) => {
    let request = http.get(`${this.url}/logs`, (response) => {
      if (destination) {
        response.pipe(fs.createWriteStream(destination, { flags: 'a' }));
      }

      let stream = response.pipe(byline.createStream());

      capture(stream);
      resolve([stream, request]);
    });
  });
};

module.exports = Device;
