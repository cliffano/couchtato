var assert = require('assert'),
    Conf = require('../lib/conf').Conf,
    fs = require('fs'),
    path = require('path'),
    vows = require('vows');

vows.describe('Conf').addBatch({
    'read when configuration file is invalid': {
        topic: function () {
            return new Conf();
        },
        'should throw error if file path is a directory': function (topic) {
            try {
                topic.read(path.join(process.cwd(), 'fixtures'));
                assert.fail('An error should have been thrown.');
            } catch (e) {
                assert.equal(e.message,
                'Unable to read configuration - ' + path.join(process.cwd(),
                'fixtures') + ' is not a file');
            }
        },
        'should throw error if file does not exist': function (topic) {
            try {
                topic.read(path.join(process.cwd(), 'fixtures/inexistant.js'));
                assert.fail('An error should have been thrown.');
            } catch (e) {
                assert.equal(e.message,
                'Unable to read configuration - Configuration file ' + path.join(process.cwd(),
                'fixtures/inexistant.js') + ' does not exist');
            }
        },
        'should throw error if file has invalid extension': function (topic) {
            try {
                topic.read(path.join(process.cwd(), 'fixtures/invalidext.blah'));
                assert.fail('An error should have been thrown.');
            } catch (e) {
                assert.equal(e.message,
                'Unable to read configuration - Configuration file extension must be \'js\', e.g. ' +
                    path.join(process.cwd(),
                'fixtures/invalidext') + '.js');
            }
        },
        'should throw error if file is blank': function (topic) {
            try {
                topic.read(path.join(process.cwd(), 'fixtures/blank.js'));
                assert.fail('An error should have been thrown.');
            } catch (e) {
                assert.equal(e.message,
                'Invalid configuration - Conf must contain tasks: exports.conf = { tasks: {} }');
            }
        },
        'should throw error if file does not contain conf': function (topic) {
            try {
                topic.read(path.join(process.cwd(), 'fixtures/noconf.js'));
                assert.fail('An error should have been thrown.');
            } catch (e) {
                assert.equal(e.message,
                'Invalid configuration - Conf must contain tasks: exports.conf = { tasks: {} }');
            }
        },
        'should throw error if conf is not an object': function (topic) {
            try {
                topic.read(path.join(process.cwd(), 'fixtures/nonobjectconf.js'));
                assert.fail('An error should have been thrown.');
            } catch (e) {
                assert.equal(e.message,
                'Invalid configuration - Conf must contain tasks: exports.conf = { tasks: {} }');
            }
        },
        'should throw error if conf has no tasks': function (topic) {
            try {
                topic.read(path.join(process.cwd(), 'fixtures/notasks.js'));
                assert.fail('An error should have been thrown.');
            } catch (e) {
                assert.equal(e.message,
                'Invalid configuration - Conf must contain tasks: exports.conf = { tasks: {} }');
            }
        },
        'should throw error if tasks is not an object': function (topic) {
            try {
                topic.read(path.join(process.cwd(), 'fixtures/nonobjecttasks.js'));
                assert.fail('An error should have been thrown.');
            } catch (e) {
                assert.equal(e.message,
                'Invalid configuration - Conf must contain tasks: exports.conf = { tasks: {} }');
            }
        }
    },
    'read when configuration file is valid': {
        topic: function () {
            return new Conf();
        },
        'should return empty object if tasks is empty': function (topic) {
            var conf = topic.read(path.join(process.cwd(), 'fixtures/emptytasks.js'));
            assert.isObject(conf.tasks);
            assert.isEmpty(conf.tasks);
        },
        'should return all tasks if they exist': function (topic) {
            var conf = topic.read(path.join(process.cwd(), 'fixtures/hastasks.js')),
                count = 0, task, i;
            for (task in conf.tasks) {
                if (conf.tasks.hasOwnProperty(task)) {
                    count += 1;
                }
            }
            assert.equal(count, 3);
        }
    },
    'init when configuration file does not exist': {
        topic: function () {
            return new Conf();
        },
        'should write file with sample conf': function (topic) {
            var file = 'build/couchtato.js', conf;
            topic.init(file);
            assert.isTrue(fs.statSync(file).isFile());
            try {
                topic.init(file);
                conf = fs.readFileSync(file, 'utf-8');
                assert.equal('exports.conf = {\n    "tasks": {\n' +
                    '        "all_docs": function (c, doc) {\n' +
                    '            console.log(doc);\n        }\n    }\n};',
                    conf);
            } catch (e) {
                assert.fail('Error should not have been thrown. ' + e.message);
            }
        }
    }
}).exportTo(module);