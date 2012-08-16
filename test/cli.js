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
        '/somedir/couchtato/couchtato': { conf: { tasks: { all_docs: function () {} } } },
        '/somedir/foobar.js': { conf: { tasks: { all_docs: function () {} } } }
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
      checks.bag_parse_commands.iterate.options.length.should.equal(8);
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

      checks.bag_parse_commands.iterate.options[0].arg.should.equal('-c, --config-file <configFile>');
      checks.bag_parse_commands.iterate.options[0].desc.should.equal('Configuration file | default: couchtato.js');
      should.not.exist(checks.bag_parse_commands.iterate.options[0].action);
      checks.bag_parse_commands.iterate.options[1].arg.should.equal('-u, --url <url>');
      checks.bag_parse_commands.iterate.options[1].desc.should.equal('CouchDB URL http(s)://user:pass@host:port/db');
      should.not.exist(checks.bag_parse_commands.iterate.options[1].action);
      checks.bag_parse_commands.iterate.options[2].arg.should.equal('-b, --batch-size <batchSize>');
      checks.bag_parse_commands.iterate.options[2].desc.should.equal('How many documents to save/remove per bulk update | default: 1000');
      (typeof checks.bag_parse_commands.iterate.options[2].action).should.equal('function');
      checks.bag_parse_commands.iterate.options[3].arg.should.equal('-p, --page-size <pageSize>');
      checks.bag_parse_commands.iterate.options[3].desc.should.equal('How many documents to retrieve per page | default: 1000');
      (typeof checks.bag_parse_commands.iterate.options[3].action).should.equal('function');
      checks.bag_parse_commands.iterate.options[4].arg.should.equal('-n, --num-pages <numPages>');
      checks.bag_parse_commands.iterate.options[4].desc.should.equal('How many pages to retrieve | default: undefined (all)');
      (typeof checks.bag_parse_commands.iterate.options[4].action).should.equal('function');
      checks.bag_parse_commands.iterate.options[5].arg.should.equal('-s, --start-key <startKey>');
      checks.bag_parse_commands.iterate.options[5].desc.should.equal('Key of first document to iterate | default: undefined (first document in the database)');
      should.not.exist(checks.bag_parse_commands.iterate.options[5].action);
      checks.bag_parse_commands.iterate.options[6].arg.should.equal('-e, --end-key <endKey>');
      checks.bag_parse_commands.iterate.options[6].desc.should.equal('Key of last document to iterate | default: undefined (last document in the database)');
      should.not.exist(checks.bag_parse_commands.iterate.options[6].action);
      checks.bag_parse_commands.iterate.options[7].arg.should.equal('-i, --interval <interval>');
      checks.bag_parse_commands.iterate.options[7].desc.should.equal('Interval between documents retrieval in milliseconds | default: 1000');
      (typeof checks.bag_parse_commands.iterate.options[7].action).should.equal('function');
    });

    it('should use custom configuration file when specified and it exists', function () {
      try {
        checks.bag_parse_commands.iterate.action({
          url: 'http://localhost:5984/somedb',
          configFile: '../foobar.js'
        });
      } catch (e) {
        should.fail('An error should not have been thrown since custom configuration should exist.' + e.message);
      }
    });

    it('should throw error when custom configuration file is specified but it does not exist', function () {
      try {
        checks.bag_parse_commands.iterate.action({
          url: 'http://localhost:5984/somedb',
          configFile: '../somefilethatdoesnotexist.js'
        });
        should.fail('An error should have been thrown since custom configuration should not exist.');
      } catch (e) {
      }
    });
  });
});
 