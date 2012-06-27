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
  this.inProgress = 0;
}

/**
 * Db#paginate
 * - interval (Number): interval between page retrievals, in milliseconds
 * - startKey (String): ID of the first document to retrieve, null indicates the first document in the database
 * - endKey (String): ID of the last document to retrieve
 * - pageCb (Function): a callback function to process documents per page retrieval
 * - cb (Function): standard cb(err, result) callback
 *
 * Retrieve documents in CouchDB database, page by page.
 * This implements linked pagination.
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
 * Db#update
 * - docs (Array): documents to be updated in a bulk
 *
 * Bulk update an array of documents.
 **/
Db.prototype.update = function (docs, cb) {
  
  this.inProgress += 1;

  var self = this;
  this.db.bulk({ docs: docs }, function (err, result) {
    self.inProgress -= 1;
    cb(err, result);
  }); 
};

Db.prototype.done = function () {
  return this.inProgress === 0;
};

module.exports = Db;