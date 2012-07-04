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

    var config = require(p.join(process.cwd(), 'couchtato')),
      opts = {
        batchSize: args.batchSize,
        pageSize: args.pageSize,
        numPages: args.numPages,
        startKey: args.startKey,
        endKey: args.endKey
      };

    new couchtato().iterate(config.conf.tasks, args.url, opts, bag.cli.exit);
  }

  var commands = {
    config: {
      desc: 'Create sample configuration file',
      action: _config
    },
    iterate: {
      desc: 'Iterate documents in CouchDB database',
      options: [
        { arg: '-c, --config <config>', desc: 'Configuration file | default: ./couchtato.js' },
        { arg: '-u, --url <url>', desc: 'CouchDB URL http(s)://user:pass@host:port/db' },
        { arg: '-b, --batch-size <batchSize>', desc: 'How many documents to save/remove per bulk update | default: 1000', action: parseInt },
        { arg: '-p, --page-size <pageSize>', desc: 'How many documents to retrieve per page | default: 1000', action: parseInt },
        { arg: '-n, --num-pages <numPages>', desc: 'How many pages to retrieve | default: undefined (all)', action: parseInt },
        { arg: '-s, --start-key <startKey>', desc: 'Key of first document to iterate | default: undefined (first document in the database)' },
        { arg: '-e, --end-key <endKey>', desc: 'Key of last document to iterate | default: undefined (last document in the database)' },
        { arg: '-i, --interval <interval>', desc: 'Interval between documents retrieval in milliseconds | default: 1000', action: parseInt }
      ],
      action: _iterate
    }
  };

  bag.cli.parse(commands, __dirname);
}

exports.exec = exec;