'use strict';

let assert = require('chai').assert;
let utils = require('../lib/utils');

// utils unit tests
describe('utils', function() {

  it('toAbsolute', function() {
    assert.isFunction(utils.toAbsolute);
  });

  it('toFQDN', function() {
    assert.isFunction(utils.toFQDN);
  });

  it('findTest', function() {
    assert.isFunction(utils.findTest);
  });
});
