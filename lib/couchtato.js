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