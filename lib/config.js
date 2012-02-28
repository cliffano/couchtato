var ncp = require('ncp'),
  p = require('path');

function Config() {

  function read(dir) {
    return require(p.join(dir, 'couchtato.js')).conf.tasks;
  }
    
  function write(dir, cb) {
    ncp.ncp(p.join(dir, '../examples/'), '.', cb);  
  }

  return {
    read: read,
    write: write
  }
}

exports.Config = Config;