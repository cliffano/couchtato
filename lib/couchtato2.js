var _ = require('underscore'),
  Config = require('./config').Config,
  Db = require('./db').Db;

function Couchtato(opts) {

  var config = new Config();

  function init(cb) {
  	config.write(opts.dir, function (err) {
      if (err) {
        console.error('An error has occured. ' + err.message);
      }
      process.exit((err) ? 1 : 0);
  	});
  }

	function iterate(cb) {

    function _report(stat) {
      console.log('Counts...');
      _.keys(stat.util).forEach(function (count) {
        console.log('- ' + count + ': ' + stat.util[count]);
      });
    }

		var db = new Db(opts.url, opts.batchSize);
		opts.tasks = config.read(opts.dir);
    db.paginate(opts.pageSize, opts.interval, opts.tasks, function (err, result) {
      if (!err) {
        _report(result);
      }
      cb(err);
    });
	}

	return {
		init: init,
		iterate: iterate
	};
}

exports.Couchtato = Couchtato;