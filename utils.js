/* eslint no-unused-vars:0 */

var path = require('path');
var validator = module.exports.validator = require('validator');

var GAIA_ORIGIN = '.gaiamobile.org';

/**
 * Recursive merge of properties from one object to another
 * @returns {object}
 */
var merge = module.exports.merge = require('deepmerge');

/**
 * Return a function which successively consumes the output of the previous
 * invocation. Evaluates arguments from right to left
 * @returns {Function}
 */
var compose = module.exports.compose = require('compose-function');

/**
 * Ensure a file or directory is in absolute form
 * @param fileOrDirectory file or directory to ensure is absolute
 * @returns {string|*}
 */
var toAbsolute = module.exports.toAbsolute = function(fileOrDirectory) {
  if (!fileOrDirectory) {
    return fileOrDirectory;
  }

  var absFileOrDirectory = fileOrDirectory;

  if (!path.isAbsolute(fileOrDirectory)) {
    absFileOrDirectory = path.join(process.cwd(), absFileOrDirectory);
  }

  return absFileOrDirectory;
};

/**
 * Convert a string to a number
 * @param {string}
 * @returns {number}
 */
var toInt = module.exports.toInt = function(str) {
  return parseInt(str, 10);
};

/**
 * Factory function to capture a given environment variable
 * @param {string} envName
 * @returns {Function}
 */
var fromEnvironment = module.exports.fromEnvironment = function(envName, defaultValue) {
  return function(value) {
    if (value !== defaultValue) {
      return value;
    }

    return process.env[envName] || defaultValue; // eslint-disable-line
  };
};

/**
 * Convert non-FQDNs to <appOrigin>.gaiamobile.org format, or leave FQDN as-is
 * @param appOrigin app name or FQDN to ensure format compliance
 * @returns {string}
 */
var toFQDN = module.exports.toFQDN = function(appOrigin) {
  var appOriginRet = appOrigin;

  if (!validator.isFQDN(appOrigin)) {
    appOriginRet += GAIA_ORIGIN;
  }

  return appOriginRet;
};

/**
 * Factory function to determine whether a particular option is validated by a
 * given function
 * @param {string} option name of the options to ensure validity
 * @param {Function} fn function used to test later-supplied value for validity
 * @returns {Function}
 */
var validate = module.exports.validate = function(option, fn) {
  // Run the supplied value through the `fn` function and determine validity
  return function(value) {
    if (!fn(value)) {
      return 'the value for "' + option + '" is not valid';
    }
  };
};

/**
 * for a given test name or filepath, resolve it to a particular test file
 * location
 * @param {string} nameOrPath test name or file path to resolve
 * @returns {string}
 */
var findTest = module.exports.findTest = function(nameOrPath) {
  try {
    return require.resolve(path.join(__dirname, 'tests', nameOrPath));
  } catch (e) {
    return require.resolve(toAbsolute(nameOrPath));
  }
};

/**
 * Pad a number with up to 6 leading zeros
 * @param {number} number Positive integer to pad
 * @returns {string}
 */
var zeroPad = module.exports.zeroPad = function(number) {
  return ('000000' + number)
    .substr(number.toString().length);
};
