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
 * Couchtato#iterate(url, opts, cb)
 * - tasks (Object): TODO
 * - url (String): CouchDB database URL in format http://user:pass@host:port/db
 * - opts (Object): TODO
 * - cb (Function): standard cb(err, result) callback
 *
 **/
Couchtato.prototype.iterate = function (tasks, url, opts, cb) {
  
  opts.batchSize = opts.batchSize || 500;
  opts.pageSize = opts.pageSize || 10000;
  opts.startKey = opts.startKey || null;
  opts.interval = opts.interval || 1000;

  function _pageCb(docs) {

    var docsCount = (docs.length === opts.pageSize + 1) ? opts.pageSize : docs.length;
    console.log('retrieved %d docs from id %s', docsCount, docs[0]._id);

    util.increment('_couchtato_docs', docsCount);
    util.increment('_couchtato_pages', 1);
    
    // apply each task to each document TODO
    _.keys(tasks).forEach(function (task) {
      docs.forEach(function (doc) {
        tasks[task](util, doc);
      });
    });
  }

  new db(url).paginate(opts.interval, opts.startKey, opts.endKey, opts.pageSize, _pageCb, function (err) {
    if (!err) {
      console.log(require('util').inspect(util.counts));
    }
    cb(err);
  });
};

module.exports = Couchtato;