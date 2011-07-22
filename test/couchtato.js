var assert = require('assert'),
    Couchtato = require('../lib/couchtato').Couchtato,
    vows = require('vows');

vows.describe('Couchtato').addBatch({
    'iterate': {
        'should call stool iterate and execute tasks': function (topic) {
            var _startKeyDocId, _pageSize, _numPages, _stool, _doc, _start, _url, _finish, _calls,
                options = {
                    pageSize: 99,
                    numPages: -1,
                    tasks: {
                        'doSomething': function (stool, doc) {
                            _stool = stool;
                            _doc = doc;
                        }
                    },
                    url: 'http://user:pass@host:port/db'
                },
                stool = {
                    iterate: function (startKeyDocId, pageSize, numPages, process, finish) {
                        _startKeyDocId = startKeyDocId;
                        _pageSize = pageSize;
                        _numPages = numPages;
                        process([ { doc: { _id: 'a' } } ]);
                        finish();
                    }
                },
                report = {
                    start: function (date, url) {
                        _start = date;
                        _url = url;
                    },
                    finish: function (date, calls) {
                        _finish = date;
                        _calls = calls;
                    },
                    log: function () {
                        return 'dummysummary';
                    }
                },
                couchtato = new Couchtato(options, stool, report);
            couchtato.iterate('abcdef');
            assert.equal(_startKeyDocId, 'abcdef');
            assert.equal(_pageSize, 99);
            assert.equal(_numPages, -1);
            assert.isFunction(_stool.iterate);
            assert.equal(_doc._id, 'a');
            assert.isNotNull(_start);
            assert.equal(_url, 'http://user:pass@host:port/db');
            assert.isNotNull(_finish);
            assert.equal(_calls, 0);
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
            assert.equal(couchtato.calls, 1);
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
            assert.equal(couchtato.calls, 1);
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
    },
    'log': {
        'should call report count with specified key': function (topic) {
            var _message,
                report = {
                    log: function (message) {
                        _message = message;
                    }
                },
                couchtato = new Couchtato({}, {}, report);
            couchtato.log('hello hello');
            assert.equal(_message, 'hello hello');
        }
    }
}).export(module);