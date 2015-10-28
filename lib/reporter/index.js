module.exports = function(options) {
  var reportToFile = require('./file')(options); // eslint-disable-line

  if (options.database) {
    var reportToDatabase = require('./database')(options); // eslint-disable-line
  }

  /**
   * Report time-series data to a file and possibly also to a database
   * determined from the configuration
   * @param {object} data
   */
  return function(data) {
    reportToFile(data);

    if (options.database) {
      reportToDatabase(data);
    }
  };
};
