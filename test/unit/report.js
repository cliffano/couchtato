var assert = require('assert'),
    Report = require('../../lib/report').Report,
    fs = require('fs'),
    path = require('path'),
    vows = require('vows');

vows.describe('Report').addBatch({
    'success called once': {
        topic: function () {
            return new Report();
        },
        'should initialise successes to empty array when key is first used': function (topic) {
            assert.isArray(topic.successes);
            assert.isEmpty(topic.successes);
        },
        'should record a single success when called once': function (topic) {
            topic.success('blah', { _id: '123' });
            assert.equal(topic.successes.length, 1);
            assert.equal(topic.successes[0].key, 'blah');
            assert.equal(topic.successes[0].doc._id, '123');
        } 
    },
    'success called multiple times': {
        topic: function () {
            return new Report();
        },
        'should record all successes': function (topic) {
            topic.success('blah', { _id: '123' });
            topic.success('blah', { _id: '456' });
            topic.success('foobar', { _id: '888' });
            assert.equal(topic.successes.length, 3);
            assert.equal(topic.successes[0].key, 'blah');
            assert.equal(topic.successes[0].doc._id, '123');
            assert.equal(topic.successes[1].key, 'blah');
            assert.equal(topic.successes[1].doc._id, '456');
            assert.equal(topic.successes[2].key, 'foobar');
            assert.equal(topic.successes[2].doc._id, '888');
        } 
    },
    'error called once': {
        topic: function () {
            return new Report();
        },
        'should initialise successes to empty array when key is first used': function (topic) {
            assert.isArray(topic.errors);
            assert.isEmpty(topic.errors);
        },
        'should record a single success when called once': function (topic) {
            topic.error('blah', { _id: '123' }, 'something went wrong');
            assert.equal(topic.errors.length, 1);
            assert.equal(topic.errors[0].key, 'blah');
            assert.equal(topic.errors[0].doc._id, '123');
            assert.equal(topic.errors[0].error, 'something went wrong');
        } 
    },
    'error called multiple times': {
        topic: function () {
            return new Report();
        },
        'should record all successes': function (topic) {
            topic.error('blah', { _id: '123' }, 'something went wrong');
            topic.error('blah', { _id: '456' }, 'bzzzt');
            topic.error('foobar', { _id: '888' }, 'uh oh');
            assert.equal(topic.errors.length, 3);
            assert.equal(topic.errors[0].key, 'blah');
            assert.equal(topic.errors[0].doc._id, '123');
            assert.equal(topic.errors[0].error, 'something went wrong');
            assert.equal(topic.errors[1].key, 'blah');
            assert.equal(topic.errors[1].doc._id, '456');
            assert.equal(topic.errors[1].error, 'bzzzt');
            assert.equal(topic.errors[2].key, 'foobar');
            assert.equal(topic.errors[2].doc._id, '888');
            assert.equal(topic.errors[2].error, 'uh oh');
        } 
    }, 
    'count': {
        topic: function () {
            return new Report();
        },
        'should initialise count to empty object when key is not yet used': function (topic) {
            assert.isObject(topic.counts);
            assert.isEmpty(topic.counts);
        },
        'should initialise count to 1 when key is first used': function (topic) {
            topic.count('blah');
            assert.equal(topic.counts.blah, 1);
        }
    },
    'count the same key multiple times': {
        topic: function () {
            return new Report();
        },
        'should increment count': function (topic) {
            topic.count('blah');
            assert.equal(topic.counts.blah, 1);
            topic.count('blah');
            topic.count('blah');
            topic.count('blah');
            assert.equal(topic.counts.blah, 4);
        }
    },
    'summary report': {
        topic: function () {
            return new Report();
        },
        'should display undefined in summary when start and finish are undefined': function (topic) {
            var summary = topic.summary();
            assert.equal(summary.length, 6);
            assert.equal(summary[3], 'START: undefined');
            assert.equal(summary[4], 'FINISH: undefined');
            assert.isTrue(summary[0] === summary[2]);
            assert.isTrue(summary[0] === summary[summary.length - 1]);
        },
        'should display dates in summary': function (topic) {
            topic.start(new Date(2011, 3, 1, 5, 6, 7, 8));
            topic.finish(new Date(2011, 3, 1, 9, 6, 7, 8));
            var summary = topic.summary();
            assert.equal(summary.length, 6);
            // ignore time zone info
            assert.isNotNull(summary[3].match(/^START: Fri Apr 01 2011 05:06:07 GMT.* /));
            assert.isNotNull(summary[4].match(/^FINISH: Fri Apr 01 2011 09:06:07 GMT.* /));
        }
    },
    'toString': {
        topic: function () {
            return new Report();
        },
        'should add a new line at the beginning of the string': function (topic) {
            var summary = [ 'aaa', 'bbb' ];
            assert.isNotNull(topic.toString(summary).match(/^\n/));
        },
        'should join the lines with new line as separator': function (topic) {
            var summary = [ 'aaa', 'bbb' ];
            assert.equal(topic.toString(summary), '\naaa\nbbb');
        }
    }
}).export(module);