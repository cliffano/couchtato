/**
 * class Util
 * - stat (Object): initial stat, used to initialise reportable page and document counts to zero
 * - queue (Array): an array of documents waiting to be updated in CouchDB
 **/
function Util(stat, queue) {
  this.stat = stat || {};
  this.queue = queue || [];
}

/**
 * Util#increment(key, increment)
 * - key (String): stat key
 * - increment (Number): increment value
 *
 * Increment stat count for existing key.
 * For new key, stat count will be set to increment value.
 **/
Util.prototype.increment = function (key, increment) {
  if (this.stat[key]) {
    this.stat[key] += increment;
  } else {
    this.stat[key] = increment;
  } 
};

/**
 * Util#count(key)
 * - key (String): stat key
 *
 * Increment stat count by 1.
 **/
Util.prototype.count = function (key) {
  this.increment(key, 1);
};

/**
 * Util#save(doc)
 * - doc (Object): CouchDB document
 *
 * Queue document for saving, increment save counter.
 **/
Util.prototype.save = function (doc) {
  this.count('_couchtato_save');
  this.queue.push(doc);
};

/**
 * Util#remove(doc)
 * - doc (Object): CouchDB document
 *
 * Mark and queue document for deletion, increment delete counter.
 **/
Util.prototype.remove = function (doc) {
  this.count('_couchtato_remove');

  doc._deleted = true;
  this.queue.push(doc);
};

/**
 * Util#log(message)
 * - message (String): the message to log
 **/
Util.prototype.log = function (message) {
  // TODO
};

module.exports = Util;