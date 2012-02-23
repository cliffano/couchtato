var _ = require('underscore'),
  async = require('async'),
  nano = require('nano'),
  url = require('url');

function Couchtato() {

	opts = {
		pageSize: 500,
		url: 'http://localhost:5984/db'
	};

	var db = url.parse(opts.url).pathname,
	  couchdb = nano(opts.url.replace(new RegExp(db + '$', 'g'), ''));
  console.log('using database: ' + db);

	function iterate(cb) {

    var docs = [],
      startKey = null,
      done = false;

		function _check() {
			return done === true;
		}

		function _do(cb) {
			couchdb.use(db).list({
				startkey_docid: startKey,
				limit: opts.pageSize + 1
			}, function (err, result) {
				if (err) {
					console.error(err.message);
					done = true;
				} else {
					console.log('retrieved ' +
					  ((result.rows.length > opts.pageSize) ? opts.pageSize : result.rows.length) +
					  ' docs, key ' + startKey);
					//console.log('result: ' + require('util').inspect(result));
					docs = docs.concat(result.rows.slice(0, opts.pageSize));
					if (result.rows.length < opts.pageSize + 1) {
						done = true;
					} else {
						startKey = result.rows[result.rows.length - 1].key;
						setTimeout(cb, 1000);
					}
				}
			});
		}

		function _done(err) {
			if (err) {
				cb(err);
			} else {
				
			}
		}

		async.until(_check, _do, _done);
	}

	return {
		iterate: iterate
	};
}

exports.Couchtato = Couchtato;