'use strict';

let R = require('ramda');
let path = require('path');
let V = require('validator');

const GAIA_ORIGIN = '.gaiamobile.org';

let toFQDN = R.cond([
  [V.isFQDN, R.identity],
  [R.T, R.partialRight(R.concat, [GAIA_ORIGIN])]
]);

let toAbsolute = R.cond([
  [R.isNil, R.identity],
  [path.isAbsolute, R.identity],
  [R.T, R.partial(path.join, [process.cwd()])]
]);

let findRelative = R.pipe(
  R.partial(path.resolve, [`${__dirname}/../tests`]),
  require.resolve
);

let findAbsolute = R.pipe(
  toAbsolute,
  require.resolve
);

let findTest = (nameOrPath) => {
  try {
    return findRelative(nameOrPath);
  } catch (e) {
    try {
      return findAbsolute(nameOrPath);
    } catch (e) {
      throw new Error(`Unable to find test with name "${nameOrPath}"`);
    }
  }
};

module.exports = {
  toAbsolute,
  toFQDN,
  findTest
};
