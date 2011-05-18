var assert = require('assert'),
    Couchtato = require('../../lib/couchtato').Couchtato,
    vows = require('vows');

vows.describe('Couchtato').addBatch({
    'iterate': {
        'should call stool iterate and execute tasks': function (topic) {
            var _startKeyDocId, _pageSize, _stool, _doc, _start, _finish,
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
    },
    'save': {
        'should call stool save with expected params': function (topic) {
            var _doc, _successCb, _errorCb,
                stool = {
                    save: function (doc, successCb, errorCb) {
                        _doc = doc;
                        _successCb = successCb;
                        _errorCb = errorCb;
                    }
                },
                couchtato = new Couchtato({}, stool, {});
            couchtato.save({ message: 'blah' });
            assert.equal(_doc.message, 'blah');
            assert.isFunction(_successCb);
            assert.isFunction(_errorCb);
        }
    },
    'remove': {
        'should call stool remove with expected params': function (topic) {
            var _doc, _successCb, _errorCb,
                stool = {
                    remove: function (doc, successCb, errorCb) {
                        _doc = doc;
                        _successCb = successCb;
                        _errorCb = errorCb;
                    }
                },
                couchtato = new Couchtato({}, stool, {});
            couchtato.remove({ message: 'blah' });
            assert.equal(_doc.message, 'blah');
            assert.isFunction(_successCb);
            assert.isFunction(_errorCb);
        }
    },
    'count': {
        'should call report count with specified key': function (topic) {
            var _keys = [],
                report = {
                    count: function (key) {
                        _keys.push(key);
                    }
                },
                couchtato = new Couchtato({}, {}, report);
            assert.equal(_keys.length, 0);
            couchtato.count('abc');
            couchtato.count('def');
            assert.equal(_keys.length, 2);
            assert.equal(_keys[0], 'abc');
            assert.equal(_keys[1], 'def');
            couchtato.count('xyz');
            assert.equal(_keys.length, 3);
            assert.equal(_keys[2], 'xyz');
        }
    }
}).export(module);