var bag = require('bagofholding'),
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
      mocks.requires = {
        './db': function (url) {
          return {
            paginate: function (interval, startKey, endKey, pageSize, pageCb, cb) {
              checks.db_paginate_interval = interval;
              checks.db_paginate_startKey = startKey;
              checks.db_paginate_endKey = endKey;
              checks.db_paginate_pageSize = pageSize;
              checks.db_paginate_pageCb = pageCb;
              checks.db_paginate_cb = cb;
            }
          }
        }
      };
    });

    it('should pass error to callback when db pagination has an error', function (done) {
      couchtato = new (create(checks, mocks))();
      couchtato.iterate({}, 'http://localhost:5984/db', {}, function (err) {
        checks.couchtato_iterate_err = err;
        done();
      });
      checks.db_paginate_cb(new Error('someerror'));
      checks.couchtato_iterate_err.message.should.equal('someerror');
    });

    it('should apply the tasks to each document when db pagination has no error', function (done) {

      checks.tasks_foo_docs = [];
      checks.tasks_bar_docs = [];

      var tasks = {
        foo: function (util, doc) {
          checks.tasks_foo_docs.push(doc);
        },
        bar: function (util, doc) {
          checks.tasks_bar_docs.push(doc);
        }
      };
      couchtato = new (create(checks, mocks))();
      couchtato.iterate(tasks, 'http://localhost:5984/db', {}, function (err) {
        checks.couchtato_iterate_err = err;
        done();
      });

      checks.db_paginate_pageCb([ { _id: 'doc1' }, { _id: 'doc2' } ]);
      checks.db_paginate_cb();

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
      checks.db_paginate_pageSize.should.equal(10000);

      // no error
      should.not.exist(checks.couchtato_iterate_err);
    });
  });
});
 