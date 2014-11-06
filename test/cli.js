var buster = require('buster-node'),
  _cli = require('bagofcli'),
  cli = require('../lib/cli'),
  Couchtato = new require('../lib/couchtato'),
  referee = require('referee'),
  assert = referee.assert;

buster.testCase('cli - exec', {
  'should contain commands with actions': function (done) {
    var mockCommand = function (base, actions) {
      assert.defined(base);
      assert.defined(actions.commands.config.action);
      assert.defined(actions.commands.iterate.action);
      done();
    };
    this.mock({});
    this.stub(_cli, 'command', mockCommand);
    cli.exec();
  }
});

buster.testCase('cli - config', {
  setUp: function () {
    this.mockConsole = this.mock(console);
  },
  'should contain config command and delegate to couchtato config when exec is called': function (done) {
    this.mockConsole.expects('log').withExactArgs('Creating example couchtato.js config');
    this.stub(_cli, 'command', function (base, actions) {
      actions.commands.config.action();
    });
    this.stub(Couchtato.prototype, 'config', function (cb) {
      assert.equals(typeof cb, 'function');
      done();
    });
    cli.exec();
  }
});

buster.testCase('cli - iterate', {
  setUp: function () {
    this.mockConsole = this.mock(console);
  },
  'should contain iterate command and delegate to couchtato iterate when exec is called': function (done) {
    this.stub(_cli, 'command', function (base, actions) {
      actions.commands.iterate.action({
        configFile: 'examples/couchtato',
        url: 'http://someurl',
        batchSize: 10,
        pageSize: 20,
        numPages: 30,
        startKey: 'somestartkey',
        endKey: 'someendkey',
        quiet: true
      });
    });
    this.stub(Couchtato.prototype, 'iterate', function (tasks, url, opts, cb) {
      assert.equals(typeof tasks.all_docs, 'function');
      assert.equals(url, 'http://someurl');
      assert.equals(opts.batchSize, 10);
      assert.equals(opts.pageSize, 20);
      assert.equals(opts.numPages, 30);
      assert.equals(opts.startKey, 'somestartkey');
      assert.equals(opts.endKey, 'someendkey');
      assert.isTrue(opts.quiet);
      assert.equals(typeof cb, 'function');
      done();
    });
    cli.exec();
  },
  'should use default couchtato.js': function (done) {
    var mockProcess = this.mock(process);
    mockProcess.expects('cwd').once().returns('../examples');
    this.stub(_cli, 'command', function (base, actions) {
      actions.commands.iterate.action({
        url: 'http://someurl',
        quiet: false
      });
    });
    this.stub(Couchtato.prototype, 'iterate', function (tasks, url, opts, cb) {
      assert.equals(typeof tasks.all_docs, 'function');
      assert.equals(url, 'http://someurl');
      assert.equals(opts.batchSize, undefined);
      assert.equals(opts.pageSize, undefined);
      assert.equals(opts.numPages, undefined);
      assert.equals(opts.startKey, undefined);
      assert.equals(opts.endKey, undefined);
      assert.isFalse(opts.quiet);
      assert.equals(typeof cb, 'function');
      done();
    });
    cli.exec();
  }
});
