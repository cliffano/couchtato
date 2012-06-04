var fsx = require('fs.extra'),
  p = require('path');

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
}

/**
 * Couchtato#iterate(url, opts, cb)
 * - url (String): CouchDB database URL in format http://user:pass@host:port/db
 * - opts (Object): TODO
 * - cb (Function): standard cb(err, result) callback
 *
 **/
Couchtato.prototype.iterate = function (url, opts, cb) {
  console.log("URL: " + url)
  console.log("opts: " + require('util').inspect(opts));
}

module.exports = Couchtato;

/*
var _ = require('underscore'),
  Db = require('./db').Db,
  p = require('path');

function Couchtato(opts) {

	function iterate(cb) {

    function _report(stat) {
      console.log('Counts...');
      _.keys(stat.util).forEach(function (count) {
        console.log('- ' + count + ': ' + stat.util[count]);
      });
    }

		var db = new Db(opts.url, opts.batchSize);
		opts.tasks = require(p.join(opts.dir, 'couchtato.js')).conf.tasks;
    db.paginate(opts.pageSize, opts.interval, opts.tasks, function (err, result) {
      if (!err) {
        _report(result);
      }
      cb(err, result);
    });
	}

	return {
		iterate: iterate
	};
}

exports.Couchtato = Couchtato;
*/