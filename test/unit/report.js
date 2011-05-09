var assert = require('assert'),
    Report = require('../../lib/report').Report,
    fs = require('fs'),
    path = require('path'),
    vows = require('vows');

vows.describe('Report').addBatch({
    'summary report': {
        topic: function () {
            return new Report();
        },
        'should display undefined in summary when start and finish are undefined': function (topic) {
            var summary = topic.summary();
            assert.equal(summary.length, 2);
            assert.equal(summary[0], 'Start: undefined');
            assert.equal(summary[1], 'Finish: undefined');
        },
        'should display dates in summary': function (topic) {
            topic.start(new Date(2011, 3, 1, 5, 6, 7, 8));
            topic.finish(new Date(2011, 3, 1, 9, 6, 7, 8));
            var summary = topic.summary();
            assert.equal(summary.length, 2);
            // ignore time zone info
            assert.isNotNull(summary[0].match(/^Start: Fri Apr 01 2011 05:06:07 GMT.*/));
            assert.isNotNull(summary[1].match(/^Finish: Fri Apr 01 2011 09:06:07 GMT.*/));
        }
    },
    'toString summary report': {
        topic: function () {
            return new Report();
        },
        'should display the same line on first and last lines': function (topic) {
            var summary = topic.toString('aaa');
            assert.isNotNull(summary.match(/^aaa/));
            assert.isNotNull(summary.match(/aaa$/));
        }
    }
}).export(module);