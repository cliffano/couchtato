var Couchtato = require('./couchtato').Couchtato,
  cly = require('cly'),
  p = require('path');

function exec() {

  var commands = {};

  commands.init = {
    callback: function (args) {
      console.log('Creating tasks file couchtato.js');
      cly.copyDir(p.join(__dirname, '../examples'), '.', cly.exit);
    }
  };

  commands.iterate = {
    options: {
      file: {
        string: '-f file',
        help: 'Configuration file, default: ./couchtato.js'
      },
      url: {
        string: '-u url',
        required: true,
        help: 'CouchDB URL http(s)://user:pass@host:port/db'
      },
      batchSize: {
        string: '-b batch_size',
        help: 'The number of documents to bulk save/remove, default: 500'
      },
      pageSize: {
        string: '-p page_size',
        help: 'The number of documents per page, default: 10000'
      },
      numPages: {
        string: '-n NUM_PAGES',
        help: 'The number of pages to iterate, default: -1 (all)'
      },
      startKey: {
        string: '-s START_KEY',
        help: 'Start key, default: undefined'
      },
      endKey: {
        string: '-e END_KEY',
        help: 'End key, default: undefined'
      }
    },
    callback: function (args) {
      new Couchtato({
        dir: process.cwd(),
        interval: 0,
        batchSize: args.batchSize || 500,
        pageSize: args.pageSize || 50,
        url: args.url
      }).iterate(cly.exit);
    }
  };

  cly.parse(__dirname, 'couchtato', commands);
}

exports.exec = exec;