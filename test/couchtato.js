var bag = require('bagofholding'),
  _jscov = require('../lib/couchtato'),
  sandbox = require('sandboxed-module'),
  should = require('should'),
  checks, mocks,
  couchtato;

describe('couchtato', function () {

  function create(checks, mocks) {
    return sandbox.require('../lib/couchtato', {
      requires: mocks.requires,
      globals: {
        console: bag.mock.console(checks),
        process: bag.mock.process(checks, mocks)
      },
      locals: {
        __dirname: '/somedir/couchtato/lib'
      }
    });
  }

  beforeEach(function () {
    checks = {};
    mocks = {};
  });

  describe('config', function () {

    it('should copy sample couchtato.js file to current directory when config is called', function (done) {
      mocks.requires = {
        'fs.extra': {
          copy: function (source, target, cb) {
            checks.fsx_copy_source = source;
            checks.fsx_copy_target = target;
            cb();
          }
        }
      };
      couchtato = new (create(checks, mocks))();
      couchtato.config(function () {
        done();
      }); 
      checks.fsx_copy_source.should.equal('/somedir/couchtato/examples/couchtato.js');
      checks.fsx_copy_target.should.equal('couchtato.js');
      checks.console_log_messages.length.should.equal(1);
      checks.console_log_messages[0].should.equal('Creating sample configuration file: couchtato.js');
    });
  });

  describe('iterate', function () {

    beforeEach(function () {
      checks.db_update_count = 0;
      checks.db_done_count = 0;
      checks.util_log_messages = [];
      var _util = require('../lib/util');
      _util.prototype.log = function (message) {
        checks.util_log_messages.push(message);
      };
      mocks.requires = {
        './util': _util,
        './db': function (url) {
          return {
            paginate: function (interval, startKey, endKey, pageSize, pageCb, endCb) {
              checks.db_paginate_interval = interval;
              checks.db_paginate_startKey = startKey;
              checks.db_paginate_endKey = endKey;
              checks.db_paginate_pageSize = pageSize;
              checks.db_paginate_pageCb = pageCb;
              checks.db_paginate_endCb = endCb;
            },
            update: function (queuedDocs, cb) {
              cb(mocks.db_update_err[checks.db_update_count], mocks.db_update_result[checks.db_update_count++]);
            },
            done: function () {
              return mocks.db_done[checks.db_done_count++];
            }
          };
        }
      };
    });

    it('should pass error to callback when db pagination has an error', function (done) {
      couchtato = new (create(checks, mocks))();
      couchtato.iterate({}, 'http://localhost:5984/db', {}, function (err) {
        checks.couchtato_iterate_err = err;
        done();
      });
      checks.db_paginate_endCb(new Error('someerror'));
      checks.couchtato_iterate_err.message.should.equal('someerror');

      // report log
      checks.util_log_messages.length.should.equal(1);
      checks.util_log_messages[0].should.equal('\n------------------------\nRetrieved 0 documents in 0 pages\nProcessed 0 saves and 0 removes\n');
    });

    it('should apply the tasks to each document when db pagination has no error and task save also has no error', function (done) {

      // simulate no error on first db update
      mocks.db_update_err = [ null ];
      mocks.db_update_result = [[ { id: 'doc1' }, { id: 'doc2' } ]];

      checks.tasks_foo_docs = [];
      checks.tasks_bar_docs = [];

      var tasks = {
        foo: function (util, doc) {
          checks.tasks_foo_docs.push(doc);
        },
        bar: function (util, doc) {
          checks.tasks_bar_docs.push(doc);
          util.save(doc);
        }
      };
      couchtato = new (create(checks, mocks))();
      couchtato.iterate(tasks, 'http://localhost:5984/db', { batchSize: 1 }, function (err) {
        checks.couchtato_iterate_err = err;
        done();
      });

      checks.db_paginate_pageCb([ { doc: { _id: 'doc1' }}, { doc: { _id: 'doc2' }} ]);
      checks.db_paginate_endCb();

      checks.console_log_messages.length.should.equal(3);
      checks.console_log_messages[0].should.equal('retrieved 2 docs - doc1');
      checks.console_log_messages[1].should.equal('updating 2 docs - doc1');
      checks.console_log_messages[2].should.equal('bulk update 2 docs done - doc1');

      // tasks are applied to each doc
      checks.tasks_foo_docs.length.should.equal(2);
      checks.tasks_foo_docs[0]._id.should.equal('doc1');
      checks.tasks_foo_docs[1]._id.should.equal('doc2');
      checks.tasks_bar_docs.length.should.equal(2);
      checks.tasks_bar_docs[0]._id.should.equal('doc1');
      checks.tasks_bar_docs[1]._id.should.equal('doc2');

      // opts set to default value
      checks.db_paginate_interval.should.equal(1000);
      should.not.exist(checks.db_paginate_startKey);
      should.not.exist(checks.db_paginate_endKey);
      checks.db_paginate_pageSize.should.equal(1000);

      // no error
      should.not.exist(checks.couchtato_iterate_err);

      // report log
      checks.util_log_messages.length.should.equal(1);
      checks.util_log_messages[0].should.equal('\n------------------------\nRetrieved 2 documents in 1 pages\nProcessed 2 saves and 0 removes\n');
    });

    it('should log error message when task save has an error', function (done) {

      // simulate error on
      mocks.db_update_err = [new Error('somesaveerror')];
      mocks.db_update_result = [ null ];

      checks.tasks_bar_docs = [];

      var tasks = {
        bar: function (util, doc) {
          checks.tasks_bar_docs.push(doc);
          util.save(doc);
        }
      };
      couchtato = new (create(checks, mocks))();
      couchtato.iterate(tasks, 'http://localhost:5984/db', { batchSize: 1 }, function (err) {
        checks.couchtato_iterate_err = err;
        done();
      });

      checks.db_paginate_pageCb([ { doc: { _id: 'doc1' }}, { doc: { _id: 'doc2' }} ]);
      checks.db_paginate_endCb();

      checks.console_error_messages.length.should.equal(1);
      checks.console_error_messages[0].should.equal('somesaveerror');

      checks.console_log_messages.length.should.equal(2);
      checks.console_log_messages[0].should.equal('retrieved 2 docs - doc1');
      checks.console_log_messages[1].should.equal('updating 2 docs - doc1');

      // tasks are applied to each doc
      checks.tasks_bar_docs.length.should.equal(2);
      checks.tasks_bar_docs[0]._id.should.equal('doc1');
      checks.tasks_bar_docs[1]._id.should.equal('doc2');

      // opts set to default value
      checks.db_paginate_interval.should.equal(1000);
      should.not.exist(checks.db_paginate_startKey);
      should.not.exist(checks.db_paginate_endKey);
      checks.db_paginate_pageSize.should.equal(1000);

      // no error
      should.not.exist(checks.couchtato_iterate_err);

      // report log
      checks.util_log_messages.length.should.equal(1);
      checks.util_log_messages[0].should.equal('\n------------------------\nRetrieved 2 documents in 1 pages\nProcessed 2 saves and 0 removes\n');
    });

    it('should call db update on remaining queued documents', function (done) {

      // simulate looping once while processing the remaining queued documents
      mocks.db_done = [ false, true ];

      // simulate no error on first db update
      mocks.db_update_err = [ null ];
      mocks.db_update_result = [[ { id: 'doc1' }, { id: 'doc2' } ]];

      checks.tasks_bar_docs = [];

      var tasks = {
        bar: function (util, doc) {
          checks.tasks_bar_docs.push(doc);
          util.save(doc);
          util.count('testcount');
        }
      };
      couchtato = new (create(checks, mocks))();
      couchtato.iterate(tasks, 'http://localhost:5984/db', { batchSize: 1000 }, function (err) {
        checks.couchtato_iterate_err = err;
        done();
      });

      checks.db_paginate_pageCb([ { doc: { _id: 'doc1' }}, { doc: { _id: 'doc2' }} ]);
      checks.db_paginate_endCb();

      checks.console_log_messages.length.should.equal(1);
      checks.console_log_messages[0].should.equal('retrieved 2 docs - doc1');

      // tasks are applied to each doc
      checks.tasks_bar_docs.length.should.equal(2);
      checks.tasks_bar_docs[0]._id.should.equal('doc1');
      checks.tasks_bar_docs[1]._id.should.equal('doc2');

      // update remaining queued documents
      (typeof checks.process_nextTick_cb).should.equal('function');

      // writes dot to stdout stream
      checks.stream_write_strings.length.should.equal(1);
      checks.stream_write_strings[0].should.equal('.');

      // opts set to default value
      checks.db_paginate_interval.should.equal(1000);
      should.not.exist(checks.db_paginate_startKey);
      should.not.exist(checks.db_paginate_endKey);
      checks.db_paginate_pageSize.should.equal(1000);

      // no error
      should.not.exist(checks.couchtato_iterate_err);

      // report log
      checks.util_log_messages.length.should.equal(1);
      checks.util_log_messages[0].should.equal('\n------------------------\nRetrieved 2 documents in 1 pages\nProcessed 2 saves and 0 removes\n- testcount: 2\n');
    });
  });
});
 