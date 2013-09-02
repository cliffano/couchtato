var log4js = require('log4js');

/**
 * class Util
 * Util is exposed to couchtato.js task functions.
 *
 * @param {Object} stat: initial stat, used to initialise reportable page and document counts to zero
 * @param {Array} queue: an array of documents waiting to be updated in CouchDB
 * @param {Object} driver: the database driver used by Couchtato, exposed via Util to allow further database operation from task functions
 */
function Util(stat, queue, driver) {
  this.stat = stat || {};
  this.queue = queue || [];
  this.driver = driver;

  log4js.loadAppender('file');
  log4js.addAppender(log4js.appenders.file('couchtato.log'), '');
  this.logger = log4js.getLogger('');
  this.logger.setLevel('INFO');
}

/**
 * Increment stat count for existing key.
 * For new key, stat count will be set to increment value.
 *
 * @param {String} key: stat key
 * @param {Number} increment: increment value
 */
Util.prototype.increment = function (key, increment) {
  if (this.stat[key]) {
    this.stat[key] += increment;
  } else {
    this.stat[key] = increment;
  } 
};

/**
 * Increment stat count by 1.
 *
 * @param {String} key: stat key
 */
Util.prototype.count = function (key) {
  this.increment(key, 1);
};

/**
 * Queue document for saving, increment save counter.
 *
 * @param {Object} doc: CouchDB document
 */
Util.prototype.save = function (doc) {
  this.count('_couchtato_save');
  this.queue.push(doc);
};

/**
 * Mark and queue document for deletion, increment delete counter.
 *
 * @param {Object} doc: CouchDB document
 */
Util.prototype.remove = function (doc) {
  this.count('_couchtato_remove');

  doc._deleted = true;
  this.queue.push(doc);
};

/**
 * Log message in file.
 *
 * @param {String} message: the message to log
 */
Util.prototype.log = function (message) {
  this.logger.info(message);
};

module.exports = Util;