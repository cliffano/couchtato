var assert = require('assert'),
    Conf = require('../../lib/conf').Conf,
    path = require('path'),
    vows = require('vows');

vows.describe('Conf').addBatch({
    'when configuration file is invalid': {
        topic: function() {
            return new Conf();
        },
        'should throw error if file path is a directory': function(topic) {
            try {
                topic.read(path.join(process.cwd(), 'test/resources'));
                assert.fail('An error should have been thrown.');
            } catch (e) {
                assert.equal(e.message, 'Unable to read configuration - ' + path.join(process.cwd(), 'test/resources') + ' is not a file');
            }
        },
        'should throw error if file does not exist': function(topic) {
            try {
                topic.read(path.join(process.cwd(),'test/resources/inexistant.js'));
                assert.fail('An error should have been thrown.');
            } catch (e) {
                assert.equal(e.message, 'Unable to read configuration - Configuration file ' + path.join(process.cwd(), 'test/resources/inexistant.js') + ' does not exist');
            }
        },
        'should throw error if file has invalid extension': function(topic) {
            try {
                topic.read(path.join(process.cwd(), 'test/resources/invalidext.blah'));
                assert.fail('An error should have been thrown.');
            } catch (e) {
                assert.equal(e.message, 'Unable to read configuration - Configuration file extension must be \'js\', e.g. ' + path.join(process.cwd(), 'test/resources/invalidext') + '.js');
            }
        },
        'should throw error if file is blank': function(topic) {
            try {
                topic.read(path.join(process.cwd(), 'test/resources/blank.js'));
                assert.fail('An error should have been thrown.');
            } catch (e) {
                assert.equal(e.message, 'Invalid configuration - Conf must contain tasks: exports.conf = { tasks: {} }');
            }
        },
        'should throw error if file does not contain conf': function(topic) {
            try {
                topic.read(path.join(process.cwd(), 'test/resources/noconf.js'));
                assert.fail('An error should have been thrown.');
            } catch (e) {
                assert.equal(e.message, 'Invalid configuration - Conf must contain tasks: exports.conf = { tasks: {} }');
            }
        },
        'should throw error if conf is not an object': function(topic) {
            try {
                topic.read(path.join(process.cwd(), 'test/resources/nonobjectconf.js'));
                assert.fail('An error should have been thrown.');
            } catch (e) {
                assert.equal(e.message, 'Invalid configuration - Conf must contain tasks: exports.conf = { tasks: {} }');
            }
        },
        'should throw error if conf has no tasks': function(topic) {
            try {
                topic.read(path.join(process.cwd(), 'test/resources/notasks.js'));
                assert.fail('An error should have been thrown.');
            } catch (e) {
                assert.equal(e.message, 'Invalid configuration - Conf must contain tasks: exports.conf = { tasks: {} }');
            }
        },
        'should throw error if tasks is not an object': function(topic) {
            try {
                topic.read(path.join(process.cwd(), 'test/resources/nonobjecttasks.js'));
                assert.fail('An error should have been thrown.');
            } catch (e) {
                assert.equal(e.message, 'Invalid configuration - Conf must contain tasks: exports.conf = { tasks: {} }');
            }
        },
        'should throw error if tasks is not an object': function(topic) {
            try {
                topic.read(path.join(process.cwd(), 'test/resources/nonobjecttasks.js'));
                assert.fail('An error should have been thrown.');
            } catch (e) {
                assert.equal(e.message, 'Invalid configuration - Conf must contain tasks: exports.conf = { tasks: {} }');
            }
        },
        'should return empty object when tasks is empty': function(topic) {
            var conf = topic.read(path.join(process.cwd(), 'test/resources/emptytasks.js'));
            assert.isObject(conf.tasks);
            assert.isEmpty(conf.tasks);
        }
    }
}).export(module);