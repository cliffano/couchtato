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

  var _util = new util({ _couchtato_docs: 0, _couchtato_pages: 0 });

  function _pageCb(docs) {

    var docsCount = (docs.length === opts.pageSize + 1) ? opts.pageSize : docs.length;
    console.log('retrieved %d docs from id %s', docsCount, docs[0]._id);

    _util.increment('_couchtato_docs', docsCount);
    _util.increment('_couchtato_pages', 1);
    
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