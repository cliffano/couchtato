var buster = require('buster-node'),
  Db = require('../lib/db'),
  referee = require('referee'),
  assert = referee.assert;

buster.testCase('db - paginate', {
  setUp: function () {
    this.pageCb = function (rows) {};
    this.mock({});
  },
  'should pass error when an error occurs while paginating the data': function (done) {
    var mockNano = {
      view: function (design, view, opts, cb) {
        assert.equals(design, 'somedesign');        
        assert.equals(view, 'someview');
        assert.equals(opts.endkey, 'someendkey');
        assert.equals(opts.endkey_docid, 'someendkey');
        assert.isTrue(opts.include_docs);
        assert.isFalse(opts.reduce);
        assert.equals(opts.limit, 3);
        assert.equals(opts.startkey, 'somestartkey');
        assert.equals(opts.startkey_docid, 'somestartkey');
        cb(new Error('some error'));
      }
    };
    this.db = new Db('http://someurl/somedb/somedesign/someview', { db: mockNano });
    this.db.paginate(1, 'somestartkey', 'someendkey', 2, 1, this.pageCb, function (err, result) {
      assert.equals(err.message, 'some error');
      done();
    });
  },
  'should finish pagination when the retrieved documents count is less than the limit': function (done) {
    var mockNano = {
      list: function (opts, cb) {
        assert.equals(opts.endkey, undefined);
        assert.equals(opts.endkey_docid, undefined);
        assert.isTrue(opts.include_docs);
        assert.isFalse(opts.reduce);
        assert.equals(opts.limit, 3);
        assert.equals(opts.startkey, 'somestartkey');
        assert.equals(opts.startkey_docid, 'somestartkey');
        cb(null, { rows: []});
      }
    };
    this.db = new Db('http://someurl/somedb', { db: mockNano });
    this.db.paginate(1, 'somestartkey', null, 2, 1, this.pageCb, done);
  },
  'should finish pagination when the last page is retrieved': function (done) {
    var mockNano = {
      list: function (opts, cb) {
        assert.equals(opts.endkey, undefined);
        assert.equals(opts.endkey_docid, undefined);
        assert.isTrue(opts.include_docs);
        assert.isFalse(opts.reduce);
        assert.equals(opts.limit, 3);
        assert.equals(opts.startkey, 'somestartkey');
        assert.equals(opts.startkey_docid, 'somestartkey');
        cb(null, { rows: [{ _id: 'someid1' }, { _id: 'someid2' }, { _id: 'someid3' }, { _id: 'someid4' }]});
      }
    };
    this.db = new Db('http://someurl/somedb', { db: mockNano });
    this.db.paginate(1, 'somestartkey', null, 2, 1, this.pageCb, done);
  },
  'should paginate when it is not the last page': function (done) {
    var mockNano = {
      list: function (opts, cb) {
        assert.isTrue(opts.include_docs);
        assert.isFalse(opts.reduce);
        assert.equals(opts.limit, 3);
        cb(null, { rows: [{ _id: 'someid1' }, { _id: 'someid2' }, { _id: 'someid3' }, { _id: 'someid4' }]});
      }
    };
    this.db = new Db('http://someurl/somedb', { db: mockNano });
    this.db.paginate(1, 'somestartkey', null, 2, 2, this.pageCb, done);
  }
});

buster.testCase('db - update', {
  setUp: function () {
    this.mock({});
  },
  'should call nano bulk update': function (done) {
    this.db = new Db('http://someurl/somedb/somedesign/someview', { db: {
      bulk: function (data, cb) {
        assert.equals(data.docs[0]._id, 'someid1');
        cb();
      }
    }});
    this.db.update([{ _id: 'someid1' }], done);
  }
});

buster.testCase('db - done', {
  setUp: function () {
    this.mock({});
    this.db = new Db('http://someurl/somedb');
  },
  'should be false when there are documents in progress': function () {
    this.db.inProgress = 1000;
    assert.isFalse(this.db.done());
  },
  'should be true when there is no document in progress': function () {
    this.db.inProgress = 0;
    assert.isTrue(this.db.done());
  }
});
