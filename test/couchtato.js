var bag = require('bagofholding'),
  sandbox = require('sandboxed-module'),
  should = require('should'),
  checks, mocks,
  couchtato;

describe('couchtato', function () {

  function create(checks, mocks) {
    return sandbox.require('../lib/couchtato', {
      requires: mocks.requires,
      globals: {
        console: bag.mock.console(checks),
        process: bag.mock.process(checks, mocks)
      },
      locals: {
        __dirname: '/somedir/couchtato/lib'
      }
    });
  }

  beforeEach(function () {
    checks = {};
    mocks = {};
  });

  describe('config', function () {

    it('should copy sample couchtato.js file to current directory when config is called', function (done) {
      mocks.requires = {
        'fs.extra': {
          copy: function (source, target, cb) {
            checks.fsx_copy_source = source;
            checks.fsx_copy_target = target;
            cb();
          }
        }
      };
      couchtato = new (create(checks, mocks))();
      couchtato.config(function () {
        done();
      }); 
      checks.fsx_copy_source.should.equal('/somedir/couchtato/examples/couchtato.js');
      checks.fsx_copy_target.should.equal('couchtato.js');
      checks.console_log_messages.length.should.equal(1);
      checks.console_log_messages[0].should.equal('Creating sample configuration file: couchtato.js');
    });
  });
});
 