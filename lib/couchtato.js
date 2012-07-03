var _ = require('underscore'),
  db = require('./db'),
  fsx = require('fs.extra'),
  p = require('path'),
  util = require('./util');

/**
 * class Couchtato
 **/
function Couchtato() {
}

/**
 * Couchtato#config(cb)
 * - cb (Function): standard cb(err, result) callback
 *
 * Create a sample couchtato.js configuration file in current directory.
 **/
Couchtato.prototype.config = function (cb) {
  console.log('Creating sample configuration file: couchtato.js');
  fsx.copy(p.join(__dirname, '../examples/couchtato.js'), 'couchtato.js', cb);
};

/**
 * Couchtato#iterate(tasks, url, opts, cb)
 * - tasks (Object): task functions to be applied to each document,  the key is a name, the value is a function with (util, doc) signature
 * - url (String): CouchDB database URL in format http://user:pass@host:port/db
 * - opts (Object): database options describing how many and how often the documents will be retrieved
 * - cb (Function): standard cb(err, result) callback
 *
 * Iterate documents in the database and apply task functions to each document.
 **/
Couchtato.prototype.iterate = function (tasks, url, opts, cb) {
  
  opts.batchSize = opts.batchSize || 500;
  opts.pageSize = opts.pageSize || 10000;
  opts.startKey = opts.startKey || null;
  opts.interval = opts.interval || 1000;

  var _util = new util({
      _couchtato_docs: 0,
      _couchtato_pages: 0,
      _couchtato_save: 0,
      _couchtato_remove: 0
    }),
    _db = new db(url);

  function _pageCb(docs) {

    var docsCount = (docs.length === opts.pageSize + 1) ? opts.pageSize : docs.length;
    console.log('retrieved %d doc%s - %s', docsCount, docsCount > 1 ? 's' : '', docs[0]._id);

    _util.increment('_couchtato_docs', docsCount);
    _util.increment('_couchtato_pages', 1);

    // apply each task to each document
    _.keys(tasks).forEach(function (task) {
      for (var i = 0; i < docsCount; i += 1) {
        tasks[task](_util, docs[i]);
      }
    });

    // bulk update queued documents
    if (_util.queue.length >= opts.batchSize) {
      var queuedDocs = _util.queue.slice(0);
      console.log('updating %d doc%s - %s', queuedDocs.length, queuedDocs.length > 1 ? 's' : '', queuedDocs[0]._id);
      _db.update(queuedDocs, function (err, result) {
        if (err) {
          console.error(err.message);
        } else {
          console.log('bulk update %d doc%s done - %s', result.length, result.length > 1 ? 's' : '', result[0].id);
        }
      });
      _util.queue = [];
    }

  }

  function _endCb(err) {

    function tock() {
      // do nothing, just ticking
    }

    function _report(err) {
      var report = '\n------------------------\n' +
        'Retrieved ' + _util.stat._couchtato_docs + ' documents in ' + _util.stat._couchtato_pages + ' pages\n' +
        'Processed ' + _util.stat._couchtato_save + ' saves and ' + _util.stat._couchtato_remove + ' removes\n';
      _.keys(_util.stat).forEach(function (prop) {
        if (!prop.match(/^_couchtato_.+/)) {
          report += '- ' + prop + ': ' + _util.stat[prop] + '\n';
        }
      });
      _util.log(report);
      cb(err);
    }

    if (!_.isEmpty(_util.queue)) {

      // update the remaining queued documents
      _db.update(_util.queue, function (err, result) {
        while (!_db.done()) {

          process.stdout.write('.');
          process.nextTick(tock);
        }
        _report(err);
      });
    // if queue is empty, then just report regardless there's an error or not
    } else {
      _report(err);
    }
  }

  _db.paginate(opts.interval, opts.startKey, opts.endKey, opts.pageSize, _pageCb, _endCb);
};

module.exports = Couchtato;
