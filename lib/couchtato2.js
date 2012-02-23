var Db = require('./db').Db;

function Couchtato() {

	opts = {
		interval: 1000,
		pageSize: 500,
		url: 'http://localhost:5984/pranala'
	};

	var db = new Db(opts.url);

	function iterate(cb) {
    db.paginate(opts.pageSize, opts.interval, function (err, result) {
    	console.error(err);
    	console.log(result);
    });
	}

	return {
		iterate: iterate
	};
}

exports.Couchtato = Couchtato;