var bag = require('bagofholding'),
  sandbox = require('sandboxed-module'),
  should = require('should'),
  checks, mocks,
  cli;

describe('cli', function () {

  function create(checks, mocks) {
    return sandbox.require('../lib/cli', {
      requires: {
        bagofholding: {
          cli: {
            exit: bag.cli.exit,
            parse: function (commands, dir) {
              checks.bag_parse_commands = commands;
              checks.bag_parse_dir = dir;
            }
          }
        },
        './couchtato': function () {
          return {
            config: function (exit) {
              checks.couchtato_config_exit = exit;
            },
            iterate: function (tasks, url, opts, exit) {
              checks.couchtato_iterate_tasks = tasks;
              checks.couchtato_iterate_url = url;
              checks.couchtato_iterate_opts = opts;
              checks.couchtato_iterate_exit = exit;
            }
          };
        },
        '/somedir/couchtato/couchtato': { conf: { tasks: { all_docs: function () {} } } }
      },
      globals: {
        process: bag.mock.process(checks, mocks)
      }
    });
  }

  beforeEach(function () {
    checks = {};
    mocks = {
      process_cwd: '/somedir/couchtato'
    };
    cli = create(checks, mocks);
    cli.exec();
  });

  describe('exec', function () {

    it('should contain config command and delegate to couchtato config when exec is called', function () {
      checks.bag_parse_commands.config.desc.should.equal('Create sample configuration file');
      checks.bag_parse_commands.config.action();
      checks.couchtato_config_exit.should.be.a('function');
    });

    it('should contain iterate command and delegate to couchtato iterate when exec is called', function () {
      checks.bag_parse_commands.iterate.desc.should.equal('Iterate documents in CouchDB database');
      checks.bag_parse_commands.iterate.action({
        url: 'http://localhost:5984/somedb',
        batchSize: 1000,
        pageSize: 10000,
        numPages: 5,
        startKey: 'a',
        endKey: 'z'
      });
      checks.couchtato_iterate_tasks.all_docs.should.be.a('function');
      checks.couchtato_iterate_url.should.equal('http://localhost:5984/somedb');
      checks.couchtato_iterate_opts.batchSize.should.equal(1000);
      checks.couchtato_iterate_opts.pageSize.should.equal(10000);
      checks.couchtato_iterate_opts.numPages.should.equal(5);
      checks.couchtato_iterate_opts.startKey.should.equal('a');
      checks.couchtato_iterate_opts.endKey.should.equal('z');
      checks.couchtato_iterate_exit.should.be.a('function');
    });
  });
});
 