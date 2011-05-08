var assert = require('assert'),
    Stool = require('../../lib/stool').Stool,
    vows = require('vows');

vows.describe('Stool').addBatch({
    'driver when constructor arg is string': {
        topic: function() {
            return new Stool('http://localhost:5984/blah');
        },
        'should return Craddle db': function(topic) {
            var driver = topic.driver();
            assert.equal(driver.name, 'blah');
            assert.isFunction(driver.all);
            assert.isFunction(driver.save);
            assert.isFunction(driver.remove);
        }
    },
    'driver when constructor arg is an object': {
        topic: function() {
            return new Stool({ blah: 'blah' });
        },
        'should return the object itself': function(topic) {
            var driver = topic.driver();
            assert.isObject(driver);
            assert.equal(driver.blah, 'blah');
        }
    },
    'driver when constructor arg is non string and non object': {
        'should throw error': function(topic) {
            try {
                new Stool(function () {});
                assert.fail('An error should have been thrown.');
            } catch (e) {
                assert.equal(e.message, 'Unexpected Stool argument of type function');
            }
        }
    }
}).export(module);