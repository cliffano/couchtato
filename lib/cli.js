var Couchtato = require('./couchtato').Couchtato,
  fs = require('fs'),
  nomnom = require('nomnom'),
  p = require('path');

function exec() {
	
  var scriptOpts = {
      version: {
        string: '-v',
        flag: true,
        help: 'Couchtato version number',
        callback: function () {
          return JSON.parse(fs.readFileSync(p.join(__dirname, '../package.json'))).version;
        }
      }
    };

  nomnom.scriptName('couchtato').opts(scriptOpts);

  nomnom.command('init').callback(function (args) {
    console.log('Creating tasks file couchtato.js');
    var couchtato = new Couchtato({
      dir: __dirname
    });
    couchtato.init(function (err) {
      if (err) {
        console.error('An error has occured. ' + err.message);
      }
      process.exit((err) ? 1 : 0);
    });
  });

  nomnom.command('iterate').opts(iterateOpts = {
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
  }).callback(function (args) {
    var couchtato = new Couchtato({
      dir: process.cwd(),
      interval: 0,
      batchSize: args.batchSize || 500,
      pageSize: args.pageSize || 50,
      url: args.url
    });
    couchtato.iterate(function (err) {
      if (err) {
        console.error('An error has occured. ' + err.message);
      }
    	process.exit((err) ? 1 : 0);
    });
  });

  nomnom.command('').callback(function (args) {
    console.log(nomnom.getUsage());
  });

  nomnom.parseArgs();
}

exports.exec = exec;