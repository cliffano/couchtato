var bag = require('bagofholding'),
  sandbox = require('sandboxed-module'),
  should = require('should'),
  checks, mocks,
  couchtato;

describe('couchtato', function () {

  function create(checks, mocks) {
    return sandbox.require('../lib/couchtato', {
      requires: mocks ? mocks.requires : {},
      globals: {}
    });
  }

  beforeEach(function () {
    checks = {};
    mocks = {};
  });

  describe('bar', function () {

    it('should foo when bar', function (done) {
    });
  });
});
 