'use strict';

let fs = require('fs');
let ndjson = require('ndjson');
let debug = require('debug')('raptor:reporter');

module.exports = (options) => {
  let destination = options.metrics;
  let stream = fs.createWriteStream(destination, { flags: 'a' });
  let serializer = ndjson.serialize();

  serializer.pipe(stream);

  /**
   * Write time-series data to an LDJSON file
   * @param {object} data
   */
  return (data) => {
    debug('Writing report results to file');
    serializer.write(data);
  };
};
