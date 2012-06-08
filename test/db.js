var bag = require('bagofholding'),
  sandbox = require('sandboxed-module'),
  should = require('should'),
  checks, mocks,
  db;

describe('db', function () {

  function create(checks, mocks) {
    return sandbox.require('../lib/db', {
      requires: mocks ? mocks.requires : {},
      globals: {}
    });
  }

  beforeEach(function () {
    checks = {};
    mocks = {};
  });

  describe('paginate', function () {

    it('should pass error to callback when an error occured while retrieving a page of documents', function () {

    });

    it('should pass all documents to page callback when there is no error', function () {

    });
  });
});
 