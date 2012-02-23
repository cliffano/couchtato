var Couchtato = require('./couchtato2').Couchtato,
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

  nomnom.command('iterate').callback(function (args) {
  	couchtato = new Couchtato()
    couchtato.iterate(function (err) {
    	process.exit((err) ? 1 : 0);
    });
  });

  nomnom.command('').callback(function (args) {
    console.log(nomnom.getUsage());
  });

  nomnom.parseArgs();
}

exports.exec = exec;