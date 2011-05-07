var fs = require('fs'),
    path = require('path');

var Conf = function () {
};
Conf.prototype._validate = function (conf) {
    if (!conf || !conf.tasks || (typeof conf.tasks !== 'object')) {
        throw new Error('Invalid configuration - Conf must contain tasks: exports.conf = { tasks: {} }');
    }
};
Conf.prototype.read = function (file) {
    var conf;
    try {
        if (!path.existsSync(file)) {
            throw new Error('Configuration file ' + file + ' does not exist');
        } else if (!fs.statSync(file).isFile()) {
            throw new Error(file + ' is not a file');
        } else if (path.extname(file) !== '.js') {
            throw new Error('Configuration file extension must be \'js\', e.g. ' + path.join(path.dirname(file), path.basename(file).split('.')[0]) + '.js');
        }
        conf = require(path.join(path.dirname(file), path.basename(file).split('.')[0])).conf;
    } catch (e) {
        e.message = 'Unable to read configuration - ' + e.message;
        throw e;
    }
    this._validate(conf);
    return conf;
};
Conf.prototype.init = function (file) {
    console.log('Creating ' + file + ' config file...');
    fs.writeFileSync(file,
        'exports.conf = {"tasks": {"all_docs": function (c, doc) {console.log(doc);}}};');
};

exports.Conf = Conf;