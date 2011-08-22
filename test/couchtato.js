var assert = require('assert'),
    Couchtato = require('../lib/couchtato').Couchtato,
    vows = require('vows');

vows.describe('Couchtato').addBatch({
    'iterate': {
        'should call stool iterate and execute tasks': function (topic) {
            var _startKeyDocId, _endKeyDocId, _pageSize, _numPages, _stool, _doc, _start, _url, _finish, _calls,
                _successDocs, _errorDocs, _errorErr,
                options = {
                    pageSize: 99,
                    numPages: -1,
                    tasks: {
                        'doSomething': function (stool, doc) {
                            _stool = stool;
                            _doc = doc;
                        }
                    },
                    url: 'http://user:pass@host:port/db',
                    startKey: 'abcdef',
                    endKey: 'zzz'
                },
                stool = {
                    iterate: function (startKeyDocId, endKeyDocId, pageSize, numPages, process, finish, successCb, errorCb) {
                        _startKeyDocId = startKeyDocId;
                        _endKeyDocId = endKeyDocId;
                        _pageSize = pageSize;
                        _numPages = numPages;
                        process([ { doc: { _id: 'a' } } ]);
                        successCb([ { id: '456', rev: 'a1' } ]);
                        errorCb([ { id: '789', rev: 'a2', _deleted: true } ], 'some error');
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
                    success: function (docs) {
                        _successDocs = docs;
                    },
                    error: function (docs, err) {
                        _errorDocs = docs;
                        _errorErr = err;
                    },
                    log: function () {
                        return 'dummysummary';
                    }
                },
                couchtato = new Couchtato(options, stool, report);
            couchtato.iterate();
            assert.equal(_startKeyDocId, 'abcdef');
            assert.equal(_endKeyDocId, 'zzz');
            assert.equal(_pageSize, 99);
            assert.equal(_numPages, -1);
            assert.isFunction(_stool.iterate);
            assert.equal(_doc._id, 'a');
            assert.isNotNull(_start);
            assert.equal(_url, 'http://user:pass@host:port/db');
            assert.isNotNull(_finish);
            assert.equal(_successDocs.length, 1);
            assert.equal(_successDocs[0].id, '456');
            assert.equal(_successDocs[0].rev, 'a1');
            assert.equal(_errorDocs.length, 1);
            assert.equal(_errorDocs[0].id, '789');
            assert.equal(_errorDocs[0].rev, 'a2');
            assert.equal(_errorErr, 'some error');
            assert.equal(_calls, 2);
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
                        return 1;
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
                        return 1;
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