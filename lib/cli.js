var _ = require('underscore'),
  bag = require('bagofholding'),
  couchtato = require('./couchtato'),
  p = require('path');

/**
 * cli#exec
 * 
 * Execute couchtato.
 **/
function exec() {

  function _config() {
    new couchtato().config(bag.cli.exit);
  }

  function _iterate(args) {
    var config = require(p.join(process.cwd(), 'couchtato'));
    new couchtato().iterate(config.conf.tasks, args.url, {
      batchSize: args.batchSize,
      pageSize: args.pageSize,
      numPages: args.numPages,
      startKey: args.startKey,
      endKey: args.endKey
    });
  }

  var commands = {
    config: {
      desc: 'Create sample configuration file',
      action: _config
    },
    iterate: {
      desc: 'Iterate CouchDB documents',
      options: [
        { arg: '-c, --config <config>', desc: 'Configuration file | default: ./couchtato.js' },
        { arg: '-u, --url <url>', desc: 'CouchDB URL http://user:pass@host:port/db' },
        { arg: '-b, --batch-size <batchSize>', desc: 'How many documents to save/remove per bulk update | default: 500' },
        { arg: '-p, --page-size <pageSize>', desc: 'How many documents to retrieve per page | default: 10000' },
        { arg: '-n, --num-pages <numPages>', desc: 'How many pages to retrieve | default: undefined (all)' },
        { arg: '-s, --start-key <startKey>', desc: 'Key of first document to iterate | default: undefined (first document in the database)' },
        { arg: '-e, --end-key <endKey>', desc: 'Key of last document to iterate | default: undefined (last document in the database)' }
      ],
      action: _iterate
    }
  };

  bag.cli.parse(commands, __dirname);
}

exports.exec = exec;