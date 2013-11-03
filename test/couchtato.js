var buster = require('buster-node'),
  Couchtato = require('../lib/couchtato'),
  Db = require('../lib/db'),
  fsx = require('fs.extra'),
  log4js = require('log4js'),
  referee = require('referee'),
  Util = require('../lib/util'),
  assert = referee.assert;

buster.testCase('couchtato - config', {
  setUp: function () {
    this.mockConsole = this.mock(console);
    this.mockFsx = this.mock(fsx);
  },
  'should delegate to fsx copy when config is called': function (done) {
    this.mockFsx.expects('copy').once().callsArgWith(2, null, 'someresult');
    var couchtato = new Couchtato();
    couchtato.config(function (err, result) {
      assert.isNull(err);
      assert.equals(result, 'someresult');
      done();
    });
  }
});

buster.testCase('couchtato - iterate page', {
  setUp: function () {
    this.mockLog4js = this.mock(log4js);
    this.spySetLevel = this.spy();
    this.spyInfo = this.spy();
    this.mockLog4js.expects('loadAppender').once().withExactArgs('file');
    this.stub(log4js, 'appenders', {
      file: function (file) {
        assert.equals(file, 'couchtato.log');
      }
    });
    this.mockLog4js.expects('addAppender').once();
    this.mockLog4js.expects('getLogger').once().withExactArgs('').returns({ setLevel: this.spySetLevel, info: this.spyInfo });
    this.spySetLevel.calledWith('INFO');

    this.mockConsole = this.mock(console);
    this.couchtato = new Couchtato();
    this.tasks = {
      sometask: function (util, doc) {
      }
    };
  },
  'should log error message when an error occurs while trying to bulk update documents': function () {
    this.mockConsole.expects('log').once().withExactArgs('retrieved %d doc%s - %s', 1, '', 'someid1');
    this.mockConsole.expects('log').once().withExactArgs('updating %d doc%s - %s', 2, 's', 'someid1');
    this.mockConsole.expects('error').once().withExactArgs('some error');

    var rows = [
        { doc: { _id: 'someid1' }},
        { doc: { _id: 'someid2' }}
      ];

    this.stub(Util.prototype, 'getQueue', function () {
      return [rows[0].doc, rows[1].doc];
    });
    this.stub(Db.prototype, 'update', function (docs, cb) {
      assert.equals(docs[0]._id, 'someid1');
      assert.equals(docs[1]._id, 'someid2');
      cb(new Error('some error'));
    });
    this.stub(Db.prototype, 'paginate', function (interval, startKey, endKey, pageSize, numPages, pageCb, endCb) {
      pageCb(rows);
    });
    this.couchtato.iterate(this.tasks, 'http://someurl', { quiet: false, batchSize: 1, pageSize: 1 }, function (err, result) {});
  },
  'should log success message when bulk update documents complete': function () {
    this.mockConsole.expects('log').once().withExactArgs('retrieved %d doc%s - %s', 2, 's', 'someid1');
    this.mockConsole.expects('log').once().withExactArgs('updating %d doc%s - %s', 2, 's', 'someid1');
    this.mockConsole.expects('log').once().withExactArgs('bulk update %d doc%s done - %s', 2, 's', 'someid1');

    var rows = [
        { doc: { _id: 'someid1' }},
        { doc: { _id: 'someid2' }}
      ];

    this.stub(Util.prototype, 'getQueue', function () {
      return [rows[0].doc, rows[1].doc];
    });
    this.stub(Db.prototype, 'update', function (docs, cb) {
      assert.equals(docs[0]._id, 'someid1');
      assert.equals(docs[1]._id, 'someid2');
      cb(null, [{ id: rows[0].doc._id }, { id: rows[1].doc._id }]);
    });
    this.stub(Db.prototype, 'paginate', function (interval, startKey, endKey, pageSize, numPages, pageCb, endCb) {
      pageCb(rows);
    });
    this.couchtato.iterate(this.tasks, 'http://someurl', { quiet: false, batchSize: 1 }, function (err, result) {});
  },
  'should not bulk update when queue docs has not reached batch size': function () {
    var rows = [
        { doc: { _id: 'someid1' }},
        { doc: { _id: 'someid2' }}
      ];

    this.stub(Util.prototype, 'getQueue', function () {
      return [rows[0].doc, rows[1].doc];
    });
    this.stub(Db.prototype, 'update', function (docs, cb) {
      assert.equals(docs[0]._id, 'someid1');
      assert.equals(docs[1]._id, 'someid2');
      cb(null, [{ id: rows[0].doc._id }, { id: rows[1].doc._id }]);
    });
    this.stub(Db.prototype, 'paginate', function (interval, startKey, endKey, pageSize, numPages, pageCb, endCb) {
      pageCb(rows);
    });
    this.couchtato.iterate(this.tasks, 'http://someurl', { quiet: true }, function (err, result) {});
  },
  'should bulk update 1 doc at a time when batch size is 1': function () {
    this.mockConsole.expects('log').once().withExactArgs('retrieved %d doc%s - %s', 1, '', 'someid1');
    this.mockConsole.expects('log').once().withExactArgs('updating %d doc%s - %s', 1, '', 'someid1');
    this.mockConsole.expects('log').once().withExactArgs('bulk update %d doc%s done - %s', 1, '', 'someid1');

    var rows = [
        { doc: { _id: 'someid1' }}
      ];

    this.stub(Util.prototype, 'getQueue', function () {
      return [rows[0].doc];
    });
    this.stub(Db.prototype, 'update', function (docs, cb) {
      assert.equals(docs[0]._id, 'someid1');
      cb(null, [{ id: rows[0].doc._id }]);
    });
    this.stub(Db.prototype, 'paginate', function (interval, startKey, endKey, pageSize, numPages, pageCb, endCb) {
      pageCb(rows);
    });
    this.couchtato.iterate(this.tasks, 'http://someurl', { quiet: false, batchSize: 1, pageSize: 0 }, function (err, result) {});
  }
});

buster.testCase('couchtato - iterate end', {
  setUp: function () {
    this.mockLog4js = this.mock(log4js);
    this.spySetLevel = this.spy();
    this.spyInfo = this.spy();
    this.mockLog4js.expects('loadAppender').once().withExactArgs('file');
    this.stub(log4js, 'appenders', {
      file: function (file) {
        assert.equals(file, 'couchtato.log');
      }
    });
    this.mockLog4js.expects('addAppender').once();
    this.mockLog4js.expects('getLogger').once().withExactArgs('').returns({ setLevel: this.spySetLevel, info: this.spyInfo });
    this.spySetLevel.calledWith('INFO');

    this.mockConsole = this.mock(console);
    this.couchtato = new Couchtato();
  },
  'should pass error to callback when pagination ends with an error': function (done) {
    this.stub(Util.prototype, 'getQueue', function () {
      return [];
    });
    this.stub(Db.prototype, 'paginate', function (interval, startKey, endKey, pageSize, numPages, pageCb, endCb) {
      endCb(new Error('some error'));
    });
    this.couchtato.iterate([], 'http://someurl', { quiet: true }, function (err, result) {
      assert.equals(err.message, 'some error');
      done(err);
    });
  },
  'should bulk update the rest of the queue when pagination ends without any error': function (done) {
    this.stub(Util.prototype, 'log', function (report) {
      assert.equals(report,
        '\n------------------------\n' +
        'Retrieved 1 documents in 2 pages\n' +
        'Processed 3 saves and 4 removes\n' +
        '- somekey: 5\n');
    });
    this.stub(Db.prototype, 'paginate', function (interval, startKey, endKey, pageSize, numPages, pageCb, endCb) {
      endCb(new Error('some error'));
    });
    var tickCount = 0;
    this.stub(Db.prototype, 'done', function () {
      if (tickCount++ === 0) {
        return false;
      } else {
        return true;
      }
    });
    this.stub(Util.prototype, 'getStat', function () {
      return {
        _couchtato_docs: 1,
        _couchtato_pages: 2,
        _couchtato_save: 3,
        _couchtato_remove: 4,
        somekey: 5
      };
    });
    this.stub(Util.prototype, 'getQueue', function () {
      return [{ _id: 'someid1' }];
    });
    this.stub(Db.prototype, 'update', function (docs, cb) {
      assert.equals(docs[0]._id, 'someid1');
      cb(null, [{ id: 'someid1' }]);
    });
    this.couchtato.iterate([], 'http://someurl', { quiet: false }, done);
  }
});
