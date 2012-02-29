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