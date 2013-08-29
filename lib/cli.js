var cli = require('bagofcli'),
  Couchtato = require('./couchtato'),
  p = require('path');

function _config() {
  console.log('Creating example couchtato.js config');
  new Couchtato().config(cli.exit);
}

function _iterate(args) {

  var config = require(p.join(process.cwd(), args.configFile || 'couchtato')),
    opts = {
      batchSize: (args.batchSize) ? parseInt(args.batchSize, 10) : undefined,
      pageSize: (args.pageSize) ? parseInt(args.pageSize, 10) : undefined,
      numPages: (args.numPages) ? parseInt(args.numPages, 10) : undefined,
      startKey: args.startKey,
      endKey: args.endKey,
      quiet: args.quiet
    };

  new Couchtato().iterate(config.conf.tasks, args.url, opts, cli.exit);
}

/**
 * Execute Couchtato CLI.
 */
function exec() {

  var actions = {
    commands: {
      config: { action: _config },
      iterate: { action: _iterate }
    }
  };

  cli.command(__dirname, actions);
}

exports.exec = exec;