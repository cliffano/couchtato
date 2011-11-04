var assert = require('assert'),
    Report = require('../lib/report').Report,
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
            topic.success([ { id: '123', rev: 'a1' }, { id: '456', rev: 'zz' } ]);
            assert.equal(topic.successes.length, 1);
            assert.equal(topic.successes[0].key, 'save');
            assert.equal(topic.successes[0].docs[0].id, '123');
            assert.equal(topic.successes[0].docs[0].rev, 'a1');
            assert.equal(topic.successes[0].docs[1].id, '456');
            assert.equal(topic.successes[0].docs[1].rev, 'zz');
        }
    },
    'success called multiple times': {
        topic: function () {
            return new Report();
        },
        'should record all successes': function (topic) {
            topic.success([ { id: '123', rev: 'g1' }, { id: '124', rev: 'g2' } ]);
            topic.success([ { id: '456', rev: 'a1', _deleted: true } ]);
            topic.success([ { id: '888', rev: 'x1' }, { id: '999', rev: 'x2' } ]);
            assert.equal(topic.successes.length, 3);
            assert.equal(topic.successes[0].key, 'save');
            assert.equal(topic.successes[0].docs[0].id, '123');
            assert.equal(topic.successes[0].docs[0].rev, 'g1');
            assert.equal(topic.successes[0].docs[1].id, '124');
            assert.equal(topic.successes[0].docs[1].rev, 'g2');
            assert.equal(topic.successes[1].key, 'remove');
            assert.equal(topic.successes[1].docs[0].id, '456');
            assert.equal(topic.successes[1].docs[0].rev, 'a1');
            assert.equal(topic.successes[2].key, 'save');
            assert.equal(topic.successes[2].docs[0].id, '888');
            assert.equal(topic.successes[2].docs[0].rev, 'x1');
            assert.equal(topic.successes[2].docs[1].id, '999');
            assert.equal(topic.successes[2].docs[1].rev, 'x2');
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
        'should record a single error when called once': function (topic) {
            topic.error([ { id: '123', rev: 'a1' }, { id: '456', rev: 'zz' } ],
                'something went wrong');
            assert.equal(topic.errors.length, 1);
            assert.equal(topic.errors[0].key, 'save');
            assert.equal(topic.errors[0].docs[0].id, '123');
            assert.equal(topic.errors[0].docs[0].rev, 'a1');
            assert.equal(topic.errors[0].docs[1].id, '456');
            assert.equal(topic.errors[0].docs[1].rev, 'zz');
            assert.equal(topic.errors[0].error, 'something went wrong');
        }
    },
    'error called multiple times': {
        topic: function () {
            return new Report();
        },
        'should record all errors': function (topic) {
            topic.error([ { id: '123', rev: 'g1' }, { id: '124', rev: 'g2' } ],
                'something went wrong');
            topic.error([ { id: '456', rev: 'a1', _deleted: true } ], 'bzzzt');
            topic.error([ { id: '888', rev: 'x1' }, { id: '999', rev: 'x2' } ], 'uh oh');
            assert.equal(topic.errors.length, 3);
            assert.equal(topic.errors[0].key, 'save');
            assert.equal(topic.errors[0].docs[0].id, '123');
            assert.equal(topic.errors[0].docs[0].rev, 'g1');
            assert.equal(topic.errors[0].docs[1].id, '124');
            assert.equal(topic.errors[0].docs[1].rev, 'g2');
            assert.equal(topic.errors[0].error, 'something went wrong');
            assert.equal(topic.errors[1].key, 'remove');
            assert.equal(topic.errors[1].docs[0].id, '456');
            assert.equal(topic.errors[1].docs[0].rev, 'a1');
            assert.equal(topic.errors[1].error, 'bzzzt');
            assert.equal(topic.errors[2].key, 'save');
            assert.equal(topic.errors[2].docs[0].id, '888');
            assert.equal(topic.errors[2].docs[0].rev, 'x1');
            assert.equal(topic.errors[2].docs[1].id, '999');
            assert.equal(topic.errors[2].docs[1].rev, 'x2');
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
    'log': {
        topic: function () {
            return new Report();
        },
        'should not give any error': function (topic) {
            try {
                topic.log('hello hello');
                topic.log(undefined);
                topic.log();
            } catch (e) {
                assert.fail('Error should not have been thrown. ' + e.message);
            }
        }
    },
    'summary report': {
        topic: function () {
            return new Report();
        },
        'should display undefined in summary when start and finish are undefined':
        function (topic) {
            var summary = topic.summary();
            assert.equal(summary.length, 4);
            assert.equal(summary[1], 'Start date: undefined');
            assert.equal(summary[2], 'Finish date: undefined');
            assert.equal(summary[3], '0 successes, 0 errors');
        },
        'should display dates and success error counts in summary': function (topic) {
            topic.start(new Date(2011, 3, 1, 5, 6, 7, 8), 'http://user:pass@host:port/db');
            topic.finish(new Date(2011, 3, 1, 9, 6, 7, 8), 777);
            var summary = topic.summary();
            assert.equal(summary.length, 4);
            // ignore time zone info
            assert.isNotNull(summary[1].match(/^Start date: Fri Apr 01 2011 05:06:07 GMT.* /));
            assert.isNotNull(summary[2].match(/^Finish date: Fri Apr 01 2011 09:06:07 GMT.* /));
            assert.equal(summary[3], '0 successes, 0 errors');
        },
        'should display counts in summary': function (topic) {
            topic.start(new Date(2011, 3, 1, 5, 6, 7, 8), 'http://user:pass@host:port/db');
            topic.finish(new Date(2011, 3, 1, 9, 6, 7, 8), 999);
            topic.count('valid doc');
            topic.count('standard doc');
            topic.count('valid doc');
            var summary = topic.summary();
            assert.equal(summary.length, 7);
            assert.equal(summary[3], '0 successes, 0 errors');
            assert.equal(summary[4], 'Counts:');
            assert.equal(summary[5], '\t- valid doc: 2');
            assert.equal(summary[6], '\t- standard doc: 1');
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
}).exportTo(module);