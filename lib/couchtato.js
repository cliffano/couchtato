var _ = require('lodash'),
  Db = require('./db'),
  fsx = require('fs.extra'),
  p = require('path'),
  Util = require('./util');

/**
 * class Couchtato
 */
function Couchtato() {
}

/**
 * Create a sample couchtato.js configuration file in current directory.
 *
 * @param {Function} cb: standard cb(err, result) callback
 */
Couchtato.prototype.config = function (cb) {
  console.log('Creating sample configuration file: couchtato.js');
  fsx.copy(p.join(__dirname, '../examples/couchtato.js'), 'couchtato.js', cb);
};

/**
 * Iterate documents in the database or view, and apply task functions to each document.
 *
 * @param {Object} tasks: task functions to be applied to each document,  the key is a name, the value is a function with (util, doc) signature
 * @param {String} url: CouchDB URL in format http(s)://user:pass@host:port/db for database, and http(s)://user:pass@host:port/db/design/view for view
 * @param {Object} opts: database options describing how many and how often the documents will be retrieved
 * @param {Function} cb: standard cb(err, result) callback
 */
Couchtato.prototype.iterate = function (tasks, url, opts, cb) {
  
  opts.batchSize = opts.batchSize || 1000;
  opts.pageSize = opts.pageSize || 1000;
  opts.numPages = opts.numPages || undefined;
  opts.startKey = opts.startKey || null;
  opts.interval = opts.interval || 1000;
  opts.quiet = opts.quiet || false;

  var _db = new Db(url),
    _util = new Util({
      _couchtato_docs: 0,
      _couchtato_pages: 0,
      _couchtato_save: 0,
      _couchtato_remove: 0
    }, [], _db.db);

  function _pageCb(rows) {

    var docsCount = (rows.length === opts.pageSize + 1) ? opts.pageSize : rows.length;
    if (opts.quiet === false) {
      console.log('retrieved %d doc%s - %s', docsCount, docsCount > 1 ? 's' : '', rows[0].doc._id);
    }
    
    _util.increment('_couchtato_docs', docsCount);
    _util.increment('_couchtato_pages', 1);

    // apply each task to each document
    _.keys(tasks).forEach(function (task) {
      for (var i = 0; i < docsCount; i += 1) {
        tasks[task](_util, rows[i].doc);
      }
    });

    // bulk update queued documents
    var queuedDocs = _util.getQueue().slice(0); // a copy of the queue
    if (queuedDocs.length >= opts.batchSize) {
      console.log('updating %d doc%s - %s', queuedDocs.length, queuedDocs.length > 1 ? 's' : '', queuedDocs[0]._id);
      _db.update(queuedDocs, function (err, result) {
        if (err) {
          console.error(err.message);
        } else {
          console.log('bulk update %d doc%s done - %s', result.length, result.length > 1 ? 's' : '', result[0].id);
        }
      });
      _util.resetQueue();
    }
  }

  function _endCb(err) {

    function _report(err) {
      if (opts.quiet === false) {
        var stat = _util.getStat(),
          report = '\n------------------------\n' +
            'Retrieved ' + stat._couchtato_docs + ' documents in ' + stat._couchtato_pages + ' pages\n' +
            'Processed ' + stat._couchtato_save + ' saves and ' + stat._couchtato_remove + ' removes\n';
        _.keys(stat).forEach(function (prop) {
          if (!prop.match(/^_couchtato_.+/)) {
            report += '- ' + prop + ': ' + stat[prop] + '\n';
          }
        });
        _util.log(report);
      }
      cb(err);
    }

    var queue = _util.getQueue();
    if (!_.isEmpty(queue)) {

      // update the remaining queued documents
      _db.update(queue, function (err, result) {
        function _wait() {
          if (_db.done()) {
            _report(err);    
          } else {
            setImmediate(_wait);
          }
        }
        _wait();
      });
    // if queue is empty, then just report regardless there's an error or not
    } else {
      _report(err);
    }
  }

  _db.paginate(opts.interval, opts.startKey, opts.endKey, opts.pageSize, opts.numPages, _pageCb, _endCb);
};

module.exports = Couchtato;
