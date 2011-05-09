var assert = require('assert'),
    Couchtato = require('../../lib/couchtato').Couchtato,
    vows = require('vows');

vows.describe('Couchtato').addBatch({
    'iterate': {
        'should call stool iterate and execute tasks': function (topic) {
            var _startKeyDocId, _pageSize, _stool, _doc,
                options = {
                    pageSize: 99,
                    tasks: {
                        'doSomething': function (stool, doc) {
                            _stool = stool;
                            _doc = doc;
                        }
                    }
                },
                stool = {
                    iterate: function (startKeyDocId, pageSize, process, finish) {
                        _startKeyDocId = startKeyDocId;
                        _pageSize = pageSize;
                        process([ { doc: { _id: 'a' } } ]);
                        finish();
                    }
                },
                report = {
                    start: function (date) {
                        _start = date;
                    },
                    finish: function (date) {
                        _finish = date;
                    },
                    log: function () {
                        return 'dummysummary';
                    }
                },
                couchtato = new Couchtato(options, stool, report);
            couchtato.iterate('abcdef');
            assert.equal(_startKeyDocId, 'abcdef');
            assert.equal(_pageSize, 99);
            assert.isFunction(_stool.iterate);
            assert.equal(_doc._id, 'a');
            assert.isNotNull(_start);
            assert.isNotNull(_finish);
        }
    }
}).export(module);