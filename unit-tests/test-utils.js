'use strict';

let assert = require('chai').assert;
let utils = require('../lib/utils');

// utils unit tests
describe('utils', () => {

  describe('functions', () => {
    it('toAbsolute', () => {
      assert.isFunction(utils.toAbsolute);
    });

    it('toFQDN', () => {
      assert.isFunction(utils.toFQDN);
    });

    it('findTest', () => {
      assert.isFunction(utils.findTest);
    });
  });

  describe('findtest', () => {
    // findtest finds coldlaunch
    it('findTest finds coldlaunch', () => {
      let pathReturned = utils.findTest('coldlaunch');

      assert.typeOf(pathReturned, 'string');
      assert.include(pathReturned, '/');
    });

    // findtest finds reboot
    it('findTest finds reboot', () => {
      let pathReturned = utils.findTest('reboot');

      assert.typeOf(pathReturned, 'string');
      assert.include(pathReturned, '/');
    });

    // findtest finds restart-b2g
    it('findTest finds restart-b2g', () => {
      let pathReturned = utils.findTest('restart-b2g');

      assert.typeOf(pathReturned, 'string');
      assert.include(pathReturned, '/');
    });

    // findtest returns error when test not found
    it('error thrown when test not found', () => {
      let errorFunc = () => utils.findTest('this filename does not exist');

      assert.throw(errorFunc, 'Unable to find test with name');
    });
  });
});
