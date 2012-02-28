var _ = require('underscore'),
  async = require('async'),
  logger = require('./logger').logger,
  nano = require('nano'),
  url = require('url'),
  valentine = require('valentine');

function Db(_url, batchSize) {
  
  var name = url.parse(_url).pathname,
    db = nano(_url.replace(new RegExp(name + '$', 'g'), '')).use(name),
    queue = [];
  logger.info('using database: ' + name);

  function flush(docs) {
    db.bulk({ docs: docs }, {}, function (err, result) {
      // TODO: check result?
      //logger.error('>>err: ' + err);
      //logger.info('>>res: ' + require('util').inspect(result));
    });
  }

  function _queue(doc) {
    if (queue.length >= batchSize) {
      var flushable = valentine.extend(queue, {});
      queue = [];
      flush(flushable);
    } else {
      queue.push(doc);
    }
  }

  function _util() {
    return {
      save: function (doc) {
        _queue(doc);        
      },
      remove: function (doc) {
        doc._delete = true;
        _queue(doc);        
      }
    }
  }

  function paginate(size, interval, tasks, cb) {

    var key = null,
      end = false,
      stat = { docs: 0, pages: 0 };
     
    function _check() {
      return end === true;
    }

    function _page(cb) {

      function _apply(docs) {
        if (!_.isEmpty(docs) && !_.isEmpty(tasks)) {
          _.keys(tasks).forEach(function (task) {
            docs.forEach(function (doc) {
              tasks[task](_util(), doc);
            });
          })
        }
      }

      db.list({
        startkey: key,
        limit: size + 1,
        include_docs: true
      }, function (err, result) {
        if (err) {
          logger.error(err.message);
          end = true;
        } else {

          var count = (result.rows.length > size) ? size : result.rows.length;
          logger.info('retrieved ' + count + ' docs, key ' + key);
          //logger.info('result: ' + require('util').inspect(result));
          
          stat.docs += count;
          stat.pages += 1;
          
          _apply(_.pluck(result.rows, 'doc'));
          
          if (result.rows.length < size + 1) {
            end = true;
          } else {
            key = result.rows[result.rows.length - 1].key;
          }
        }
        setTimeout(cb, interval);
      });
    }

    function _end(err) {
      // TODO flush the rest of the queue
      cb(err, stat);
    }

    async.until(_check, _page, _end);
  }

  return {
    flush: flush,
    paginate: paginate
  };
}

exports.Db = Db;