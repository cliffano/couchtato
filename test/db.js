var bag = require('bagofholding'),
  sandbox = require('sandboxed-module'),
  should = require('should'),
  checks, mocks,
  db;

describe('db', function () {

  function create(checks, mocks) {
    return sandbox.require('../lib/db', {
      requires: {
        nano: function (dbUrl) {
          checks.nano_dburl = dbUrl;

          return {
            use: function (dbName) {
              checks.nano_use_dbname = dbName;
              var count = 0;
              return {
                list: function (opts, cb) {
                  cb(
                    mocks.nano_list_err, 
                    mocks.nano_list_results ? mocks.nano_list_results[count++] : undefined
                  );
                }
              };
            }
          };
        }
      },
      globals: {}
    });
  }

  beforeEach(function () {
    checks = {};
    mocks = {};
  });

  describe('paginate', function () {

    it('should pass error to callback when an error occured while retrieving a page of documents', function (done) {
      mocks.nano_list_err = new Error('someerror');
      db = new (create(checks, mocks))('http://localhost:5984/somedb');
      db.paginate(1000, null, undefined, 10000, function() {}, function (err) {
        checks.db_paginate_err = err;
        done();
      });
      checks.db_paginate_err.message.should.equal('someerror');
    });

    it('should pass all documents to page callback when there is no error', function () {

      // simulate first page result to include the first doc of second page result
      mocks.nano_list_results = [
        { rows: [ { doc: { _id: 1 } }, { doc: { _id: 2 } }, { doc: { _id: 3 } } ] },
        { rows: [ { doc: { _id: 3 } }, { doc: { _id: 4 } } ] }
      ];

      db = new (create(checks, mocks))('http://localhost:5984/somedb');

      checks.db_docs = [];
      function pageCb(docs) {
        checks.db_docs = checks.db_docs.concat(docs);
      }

      db.paginate(0, null, undefined, 2, pageCb, function (err) {
        checks.db_paginate_err = err;
        checks.db_docs.length.should.equal(5);
        checks.db_docs[0]._id = 1;
        checks.db_docs[1]._id = 2;
        checks.db_docs[2]._id = 3;
        checks.db_docs[3]._id = 3;
        checks.db_docs[4]._id = 4;
        should.not.exist(checks.nano_list_err);
      });
    });
  });
});
 