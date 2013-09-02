var _ = require('underscore'),
  async = require('async'),
  nano = require('nano'),
  url = require('url');

/**
 * class Db
 *
 * @param {String} _url: CouchDB URL in format http(s)://user:pass@host:port/db for database,
 *                       and http(s)://user:pass@host:port/db/design/view for view
 */
function Db(_url, opts) {
  opts = opts || {};

  var dbPath = url.parse(_url.replace(/\/$/, '')).pathname.replace(/^\//, ''),
    dbPathElems = dbPath.split('/'),
    dbUrl;

  if (dbPathElems.length === 1) {
    this.dbName = dbPathElems[0];
  } else {
    this.dbName = dbPathElems[0];
    this.dbDesign = dbPathElems[1];
    this.dbView = dbPathElems[2];
  }

  dbUrl = _url.replace(new RegExp(dbPath + '$', 'g'), '');
  this.db = opts.db || nano(dbUrl).use(this.dbName);
  this.inProgress = 0;
}

/**
 * Retrieve documents in CouchDB database or view, page by page.
 * This implements linked list pagination - http://guide.couchdb.org/draft/recipes.html#fast .
 *
 * @param {Number} interval: interval between page retrievals, in milliseconds
 * @param {String} startKey: key of the first document to retrieve, null indicates the first document in the database
 * @param {String} endKey: key of the last document to retrieve
 * @param {String} pageSize: how many documents to retrieve per page
 * @param {String} numPages: how many pages to retrieve, undefined means all
 * @param {Function} pageCb: a callback function to process documents per page retrieval
 * @param {Function} cb: standard cb(err, result) callback
 */
Db.prototype.paginate = function (interval, startKey, endKey, pageSize, numPages, pageCb, cb) {

  var done = false,
    pageCount = 0,
    key = startKey,
    key_docid = startKey,
    self = this;

  function _action(cb) {

    // both startkey and startkey_docid are specified to handle a view index with duplicated keys
    var opts = {
      startkey: key,
      startkey_docid: key_docid,
      limit: pageSize + 1,
      include_docs: true
    };

    // unlike startkey/startkey_docid, null endkey/endkey_docid does not mean last document in the database
    // don't set endkey_docid option unless endKey argument is set
    if (endKey) {
      opts.endkey = endKey;
      opts.endkey_docid = endKey;
    }

    function _actionCb(err, result) {

      if (err) {
        cb(err);

      } else {
        pageCb(result.rows);

        // when the number of retrieved documents is less than the limit,
        // or the page count is the number of pages to retrieve,
        // that means it's the last page
        if (result.rows.length < opts.limit || pageCount === numPages - 1) {
          done = true;
          interval = 0;
        // if not last page, then use the last document's key/id as the startkey/startkey_docid of the first document on the next page
        } else {
          key = result.rows[result.rows.length - 1].key;
          key_docid = result.rows[result.rows.length - 1].id;
          pageCount++;
        }
        setTimeout(cb, interval);
      }
    }

    if (self.dbView) {
      self.db.view(self.dbDesign, self.dbView, opts, _actionCb);
    } else {
      self.db.list(opts, _actionCb);
    }
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
 * @param {Function} cb: standard cb(err, result) callback
 */
Db.prototype.update = function (docs, cb) {
  
  this.inProgress += 1;

  var self = this;
  // NOTE: when CouchDB instance requires authentication and the URL does not supply a username and password,
  // nano bulk callback is called with null error and unmodified documents in CouchDB as the result, ignoring the modified documents.
  // Ideally nano should pass an error.
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
