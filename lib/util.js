var counts = {};

function increment(key, increment) {
  if (counts[key]) {
    counts[key] += increment;
  } else {
    counts[key] = 1;
  } 
}

function count(key) {
  incrementCount(key, 1);
}

function save(doc) {
  count('_couchtato_save');
}

function remove(doc) {
  count('_couchtato_remove');
}

exports.increment = increment;
exports.count = count;
exports.counts = counts;
exports.save = save;
exports.remove = remove;

/*
var stat = {};

function count(key) {
  if (stat[key]) {
    stat[key] += 1;
  } else {
    stat[key] = 1;
  }
}

function get() {
  return stat;
}

exports.count = count;
exports.get = get;

  function _util() {
    return {
      save: function (doc) {
        _queue(doc);
        counter.count('couchtato.save');
      },
      remove: function (doc) {
        doc._delete = true;
        _queue(doc);        
        counter.count('couchtato.remove');
      },
      count: function (key) {
        counter.count(key);
      }
    };
  }
*/