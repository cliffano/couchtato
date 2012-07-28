var _ = require('underscore'),
  async = require('async'),
  nano = require('nano'),
  url = require('url');

/**
 * class Db
 *
 * @param {String} _url: CouchDB URL in format http(s)://user:pass@host:port/db
 */
function Db(_url) {

  var dbName = url.parse(_url).pathname,
    dbUrl = _url.replace(new RegExp(dbName + '$', 'g'), '');

  this.db = nano(dbUrl).use(dbName);
  this.inProgress = 0;
}

/**
 * Retrieve documents in CouchDB database, page by page.
 * This implements linked list pagination - http://guide.couchdb.org/draft/recipes.html#fast .
 *
 * @param {Number} interval: interval between page retrievals, in milliseconds
 * @param {String} startKey: ID of the first document to retrieve, null indicates the first document in the database
 * @param {String} endKey: ID of the last document to retrieve
 * @param {Function} pageCb: a callback function to process documents per page retrieval
 * @param {Function} cb: standard cb(err, result) callback
 */
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
    // unlike startkey_docid, null endkey_docid does not mean last document in the database
    // don't set endkey_docid option unless endKey argument is set
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
          interval = 0;
        // if not last page, then use the last document's key as the startkey of the first document on the next page
        } else {
          key = result.rows[result.rows.length - 1].key;
        }
        setTimeout(cb, interval);
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
};

/**
 * Bulk update an array of documents.
 *
 * @param {Array} docs: documents to be bulk updated
 */
Db.prototype.update = function (docs, cb) {
  
  this.inProgress += 1;

  var self = this;
  this.db.bulk({ docs: docs }, function (err, result) {
    self.inProgress -= 1;
    cb(err, result);
  }); 
};

/**
 * Check if there's any database operation (documents save/remove) in progress.
 *
 * @return {Boolean} true if there's no database operation in progress, false otherwise.
 */
Db.prototype.done = function () {
  return this.inProgress === 0;
};

module.exports = Db;
