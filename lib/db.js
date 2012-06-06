var _ = require('underscore'),
  async = require('async'),
  nano = require('nano'),
  url = require('url');

/**
 * class Db
 * - _url (String): CouchDB URL in format http(s)://user:pass@host:port/db
 **/
function Db(_url) {

  var dbName = url.parse(_url).pathname,
    dbUrl = _url.replace(new RegExp(dbName + '$', 'g'), '');

  this.db = nano(dbUrl).use(dbName);
}

/**
 * Db#paginate
 * - startKey (String): TODO
 * - endKey (String): TODO
 * - cb (Function): standard cb(err, result) callback
 *
 * This implements list pagination!
 **/
Db.prototype.paginate = function (interval, startKey, endKey, pageSize, pageCb, cb) {

  var done = false,
    key = startKey,
    self = this;

  function _action(cb) {

    var opts = {
      startkey_docid: key,
      limit: pageSize + 1,
      include_docs: true
    };
    if (endKey) {
      opts.endkey_docid = endKey;
    }

    self.db.list(opts, function (err, result) {

      if (err) {
        cb(err);

      } else {

        pageCb(_.pluck(result.rows, 'doc'));

        // when the number of retrieved documents is less than the limit, that means it's the last page
        if (result.rows.length < opts.limit) {
          done = true;
        // if not last page, the use the last document's key as the startkey of the first document on the next page
        } else {
          key = result.rows[result.rows.length - 1].key;
          setTimeout(cb, interval);
        }
      }
    });
  }

  function _check() {
    return done === true;
  }

  function _end(err) {
    cb(err);
  }

  async.until(_check, _action, _end);
}

module.exports = Db;