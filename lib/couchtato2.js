var Config = require('./config').Config,
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
		var db = new Db(opts.url, opts.batchSize);
		opts.tasks = config.read(opts.dir);
    db.paginate(opts.pageSize, opts.interval, opts.tasks, function (err, result) {
      if (err) {
        console.error('An error has occured. ' + err.message);
      }
    	console.log(require('util').inspect(result));
    	process.exit((err) ? 1 : 0);
    });
	}

	return {
		init: init,
		iterate: iterate
	};
}

exports.Couchtato = Couchtato;