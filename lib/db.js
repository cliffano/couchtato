var async = require('async'),
  logger = require('./logger').logger,
  nano = require('nano'),
  url = require('url');

function Db(_url) {
	
	var name = url.parse(_url).pathname,
	  instance = nano(opts.url.replace(new RegExp(name + '$', 'g'), ''));
	logger.info('using database: ' + name);

	function paginate(size, interval, cb) {

		var key = null,
		  end = false,
		  count = 0;
		 
		function _check() {
			return end === true;
		}

		function _page(cb) {
			instance.use(name).list({
				startkey: key,
				limit: size + 1
			}, function (err, result) {
				if (err) {
					logger.error(err.message);
					end = true;
				} else {
					logger.info('retrieved ' +
					  ((result.rows.length > size) ? size : result.rows.length) +
					  ' docs, key ' + key);
					//logger.info('result: ' + require('util').inspect(result));
					count += result.rows.length;
					if (result.rows.length < size + 1) {
						end = true;
					} else {
						key = result.rows[result.rows.length - 1].key;
						setTimeout(cb, interval);
					}
				}
			});
		}

		function _end(err) {
			console.log(err + count);
			cb(err, count);
		}

		async.until(_check, _page, _end);
	}

	return {
		paginate: paginate
	};
}

exports.Db = Db;