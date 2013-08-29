var buster = require('buster'),
  _cli = require('bagofcli'),
  cli = require('../lib/cli'),
  Couchtato = new require('../lib/couchtato');

buster.testCase('cli - exec', {
  'should contain commands with actions': function (done) {
    var mockCommand = function (base, actions) {
      assert.defined(base);
      assert.defined(actions.commands.config.action);
      assert.defined(actions.commands.iterate.action);
      done();
    };
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