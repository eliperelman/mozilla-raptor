var Parser = require('./parser');
var TOKEN = 'PerformanceFilesize';

/**
 * Determine whether a log entry is one for a device filesize entry
 * @param {object} item ADB log entry
 * @returns {boolean}
 */
var matcher = function(item) {
  return item.tag === TOKEN;
};

/**
 * Parse an ADB log entry and extract an application's memory entry
 * @param {object} item ADB log entry
 * @returns {{context: String, name: String, value: Number, entryType: String}}
 */
var parser = function(item) {
  var parts = item.message.split('|');
  return {
    context: 'system.gaiamobile.org',
    name: 'filesize.' + parts[0].substr(1),
    value: parseFloat(parts[2]) / 1024 / 1024,
    entryType: 'filesize'
  };
};

module.exports = Parser('filesizeentry', matcher, parser);
