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
                bulk: function (opts, cb) {
                  checks.nano_bulk_opts = opts;
                  cb(
                    mocks.nano_bulk_err, 
                    mocks.nano_bulk_results ? mocks.nano_bulk_results[count++] : undefined
                  );                  
                },
                list: function (opts, cb) {
                  checks.nano_list_opts = opts;
                  cb(
                    mocks.nano_list_err, 
                    mocks.nano_list_results ? mocks.nano_list_results[count++] : undefined
                  );
                },
                view: function (design, view, opts, cb) {
                  checks.nano_view_design = design;
                  checks.nano_view_view = view;
                  checks.nano_view_opts = opts;
                  cb(
                    mocks.nano_view_err, 
                    mocks.nano_view_results ? mocks.nano_view_results[count++] : undefined
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

    it('should pass error to callback when an error occured while retrieving a page of documents from a database', function (done) {
      mocks.nano_list_err = new Error('someerror');
      db = new (create(checks, mocks))('http://localhost:5984/somedb');
      db.paginate(1000, null, undefined, 10000, undefined, function() {}, function (err) {
        checks.db_paginate_err = err;
        done();
      });
      checks.db_paginate_err.message.should.equal('someerror');
      should.not.exist(checks.nano_list_opts.startkey);
      should.not.exist(checks.nano_list_opts.startkey_docid);
      checks.nano_list_opts.limit.should.equal(10001);
      checks.nano_list_opts.include_docs.should.equal(true);
      should.not.exist(checks.nano_list_opts.endkey);
      should.not.exist(checks.nano_list_opts.endkey_docid);
    });

    it('should pass error to callback when an error occured while retrieving a page of documents from a view', function (done) {
      mocks.nano_view_err = new Error('someerror');
      db = new (create(checks, mocks))('http://localhost:5984/somedb/somedesign/someview');
      db.paginate(1000, null, undefined, 10000, undefined, function() {}, function (err) {
        checks.db_paginate_err = err;
        done();
      });
      checks.nano_view_design.should.equal('somedesign');
      checks.nano_view_view.should.equal('someview');
      checks.db_paginate_err.message.should.equal('someerror');
      should.not.exist(checks.nano_view_opts.startkey);
      should.not.exist(checks.nano_view_opts.startkey_docid);
      checks.nano_view_opts.limit.should.equal(10001);
      checks.nano_view_opts.include_docs.should.equal(true);
      should.not.exist(checks.nano_view_opts.endkey);
      should.not.exist(checks.nano_view_opts.endkey_docid);
    });

    it('should pass all documents to page callback when there is no error while iterating database', function (done) {

      // simulate first page result to include the first doc of second page result
      mocks.nano_list_results = [
        { rows: [ { doc: { _id: 1 } }, { doc: { _id: 2 } }, { doc: { _id: 3 } } ] },
        { rows: [ { doc: { _id: 3 } }, { doc: { _id: 4 } } ] }
      ];

      db = new (create(checks, mocks))('http://localhost:5984/somedb');

      checks.db_rows = [];
      function pageCb(rows) {
        checks.db_rows = checks.db_rows.concat(rows);
      }

      db.paginate(0, null, 'someendkey', 2, undefined, pageCb, function (err) {
        checks.db_paginate_err = err;
        checks.db_rows.length.should.equal(5);
        checks.db_rows[0].doc._id.should.equal(1);
        checks.db_rows[1].doc._id.should.equal(2);
        checks.db_rows[2].doc._id.should.equal(3);
        checks.db_rows[3].doc._id.should.equal(3);
        checks.db_rows[4].doc._id.should.equal(4);
        should.not.exist(checks.nano_list_err);
        done();
      });
      should.not.exist(checks.nano_list_opts.startkey);
      should.not.exist(checks.nano_list_opts.startkey_docid);
      checks.nano_list_opts.limit.should.equal(3);
      checks.nano_list_opts.include_docs.should.equal(true);
      checks.nano_list_opts.endkey.should.equal('someendkey');
      checks.nano_list_opts.endkey_docid.should.equal('someendkey');
    });

    it('should pass all documents to page callback when there is no error while iterating view', function (done) {

      // simulate first page result to include the first doc of second page result
      mocks.nano_view_results = [
        { rows: [ { doc: { _id: 1 } }, { doc: { _id: 2 } }, { doc: { _id: 3 } } ] },
        { rows: [ { doc: { _id: 3 } }, { doc: { _id: 4 } } ] }
      ];

      db = new (create(checks, mocks))('http://localhost:5984/somedb/somedesign/someview');

      checks.db_rows = [];
      function pageCb(rows) {
        checks.db_rows = checks.db_rows.concat(rows);
      }

      db.paginate(0, null, 'someendkey', 2, undefined, pageCb, function (err) {
        checks.db_paginate_err = err;
        checks.db_rows.length.should.equal(5);
        checks.db_rows[0].doc._id.should.equal(1);
        checks.db_rows[1].doc._id.should.equal(2);
        checks.db_rows[2].doc._id.should.equal(3);
        checks.db_rows[3].doc._id.should.equal(3);
        checks.db_rows[4].doc._id.should.equal(4);
        should.not.exist(checks.nano_view_err);
        done();
      });
      should.not.exist(checks.nano_view_opts.startkey);
      should.not.exist(checks.nano_view_opts.startkey_docid);
      checks.nano_view_opts.limit.should.equal(3);
      checks.nano_view_opts.include_docs.should.equal(true);
      checks.nano_view_opts.endkey.should.equal('someendkey');
      checks.nano_view_opts.endkey_docid.should.equal('someendkey');
    });

    it('should only retrieve one page even though result contains two pages, when num pages is set to one', function (done) {

      // simulate first page result to include the first doc of second page result
      mocks.nano_view_results = [
        { rows: [ { doc: { _id: 1 } }, { doc: { _id: 2 } }, { doc: { _id: 3 } } ] },
        { rows: [ { doc: { _id: 3 } }, { doc: { _id: 4 } } ] }
      ];

      db = new (create(checks, mocks))('http://localhost:5984/somedb/somedesign/someview');

      checks.db_rows = [];
      function pageCb(rows) {
        checks.db_rows = checks.db_rows.concat(rows);
      }

      db.paginate(0, null, 'someendkey', 2, 1, pageCb, function (err) {
        checks.db_paginate_err = err;
        checks.db_rows.length.should.equal(3);
        checks.db_rows[0].doc._id.should.equal(1);
        checks.db_rows[1].doc._id.should.equal(2);
        checks.db_rows[2].doc._id.should.equal(3);
        should.not.exist(checks.nano_view_err);
        done();
      });
      should.not.exist(checks.nano_view_opts.startkey);
      should.not.exist(checks.nano_view_opts.startkey_docid);
      checks.nano_view_opts.limit.should.equal(3);
      checks.nano_view_opts.include_docs.should.equal(true);
      checks.nano_view_opts.endkey.should.equal('someendkey');
      checks.nano_view_opts.endkey_docid.should.equal('someendkey');
    });
  });

  describe('update', function () {

    it('should bulk update documents when update is called', function (done) {
      mocks.nano_bulk_results = [
        [ { ok: true, id: 'a', rev: '26-22c3d5cd7a4d07fb1f4d12fd651de3ca' },
          { ok: true, id: 'b', rev: '34-c631c7cd79802c51f758fd41164cdb5b' } ]
      ];
      db = new (create(checks, mocks))('http://localhost:5984/somedb');
      db.update([ { _id: 'a' }, { _id: 'b' }], function (err, result) {
        checks.db_update_err = err;
        checks.db_update_result = result;
        done();
      });
      should.not.exist(checks.db_update_err);
      checks.db_update_result.length.should.equal(2);
      checks.db_update_result[0].id.should.equal('a');
      checks.db_update_result[1].id.should.equal('b');
      checks.nano_bulk_opts.docs.length.should.equal(2);
      checks.nano_bulk_opts.docs[0]._id.should.equal('a');
      checks.nano_bulk_opts.docs[1]._id.should.equal('b');
      db.inProgress.should.equal(0);
    });
  });

  describe('done', function () {

    it('should set done status to true on a constructed db when no update is performed', function () {
      db = new (create(checks, mocks))('http://localhost:5984/somedb');
      db.done().should.equal(true);
    });
  });
});
 