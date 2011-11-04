var assert = require('assert'),
    Stool = require('../lib/stool/cradle').Stool,
    vows = require('vows');

vows.describe('Stool').addBatch({
    'driver when constructor arg has url': {
        topic: function () {
            return new Stool({ url: 'http://localhost:5984/blah' });
        },
        'should return Craddle db': function (topic) {
            var driver = topic.driver();
            assert.equal(driver.name, 'blah');
            assert.isFunction(driver.all);
            assert.isFunction(driver.save);
            assert.isFunction(driver.remove);
        }
    },
    'iterate when database exists': {
        'should throw error when callback error is provided': function (topic) {
            var _result,
                _options,
                _finishCallCount = 0,
                _successCbCallCount = 0,
                _errorCbCallCount = 0,
                db = {
                    all: function (options, cb) {
                        _options = options;
                        cb({error: 'Danger!', reason: 'Sharks'}, undefined);
                    }
                },
                process = function (result) {
                    _result = result;
                },
                finish = function () {
                    _finishCallCount = 1;
                },
                successCb = function (docs, err) {
                    _successCbCallCount = 1;
                },
                errorCb = function (docs, res) {
                    _errorCbCallCount = 1;
                },
                stool = new Stool({ db: db, batchSize: 1 });
            try {
                stool.iterate({
                    startKeyDocId: undefined,
                    endKeyDocId: undefined,
                    pageSize: 2,
                    numPages: -1 },
                    process);
                assert.fail('An error should have been thrown.');
            } catch (e) {
                assert.equal(e.message, 'Danger! - Sharks');
            }
            assert.isTrue(_options.include_docs);
            assert.equal(_options.limit, 3);
            assert.isUndefined(_options.startkey_docid);
            assert.isUndefined(_result);
            assert.equal(_finishCallCount, 0);
            assert.equal(_successCbCallCount, 0);
            assert.equal(_errorCbCallCount, 0);
        },
        'should call all once when result is empty': function (topic) {
            var _result,
                _options,
                _finishCallCount = 0,
                _successCbCallCount = 0,
                _errorCbCallCount = 0,
                db = {
                    all: function (options, cb) {
                        _options = options;
                        cb(undefined, []);
                    }
                },
                process = function (result) {
                    _result = result;
                },
                finish = function () {
                    _finishCallCount = 1;
                },
                successCb = function (docs, err) {
                    _successCbCallCount = 1;
                },
                errorCb = function (docs, res) {
                    _errorCbCallCount = 1;
                },
                stool = new Stool({ db: db, batchSize: 1 });
            stool.iterate({
                    startKeyDocId: undefined,
                    endKeyDocId: undefined,
                    pageSize: 2,
                    numPages: -1 },
                    process, finish);
            assert.isTrue(_options.include_docs);
            assert.equal(_options.limit, 3);
            assert.isUndefined(_options.startkey_docid);
            assert.equal(_result.length, 0);
            assert.equal(_finishCallCount, 1);
            assert.equal(_successCbCallCount, 0);
            assert.equal(_errorCbCallCount, 0);
        },
        'should call all once when result is less than page size': function (topic) {
            var _result,
                _options,
                _finishCallCount = 0,
                _successCbCallCount = 0,
                _errorCbCallCount = 0,
                db = {
                    all: function (options, cb) {
                        _options = options;
                        cb(undefined, [ { doc: { _id: 'a' } } ]);
                    }
                },
                process = function (result) {
                    _result = result;
                },
                finish = function () {
                    _finishCallCount = 1;
                },
                successCb = function (docs, err) {
                    _successCbCallCount = 1;
                },
                errorCb = function (docs, res) {
                    _errorCbCallCount = 1;
                },
                stool = new Stool({ db: db, batchSize: 1 });
            stool.iterate({
                    startKeyDocId: undefined,
                    endKeyDocId: undefined,
                    pageSize: 2,
                    numPages: -1 },
                    process, finish);
            assert.isTrue(_options.include_docs);
            assert.equal(_options.limit, 3);
            assert.isUndefined(_options.startkey_docid);
            assert.isUndefined(_options.endkey_docid);
            assert.equal(_result.length, 1);
            assert.equal(_result[0].doc._id, 'a');
            assert.equal(_finishCallCount, 1);
            assert.equal(_successCbCallCount, 0);
            assert.equal(_errorCbCallCount, 0);
        },
        'should call all once when result is exactly the page size': function (topic) {
            var _result,
                _options,
                _finishCallCount = 0,
                _successCbCallCount = 0,
                _errorCbCallCount = 0,
                db = {
                    all: function (options, cb) {
                        _options = options;
                        cb(undefined, [ { doc: { _id: 'a' } }, { doc: { _id: 'b' } } ]);
                    }
                },
                process = function (result) {
                    _result = result;
                },
                finish = function () {
                    _finishCallCount = 1;
                },
                successCb = function (docs, err) {
                    _successCbCallCount = 1;
                },
                errorCb = function (docs, res) {
                    _errorCbCallCount = 1;
                },
                stool = new Stool({ db: db, batchSize: 1 });
            stool.iterate({
                    startKeyDocId: undefined,
                    endKeyDocId: undefined,
                    pageSize: 2,
                    numPages: -1 },
                    process, finish);
            assert.isTrue(_options.include_docs);
            assert.equal(_options.limit, 3);
            assert.isUndefined(_options.startkey_docid);
            assert.isUndefined(_options.endkey_docid);
            assert.equal(_result.length, 2);
            assert.equal(_result[0].doc._id, 'a');
            assert.equal(_result[1].doc._id, 'b');
            assert.equal(_finishCallCount, 1);
            assert.equal(_successCbCallCount, 0);
            assert.equal(_errorCbCallCount, 0);
        },
        'should call all twice when result is more than page size': function (topic) {
            var _result,
                _options,
                dbCallCount = 0,
                _finishCallCount = 0,
                _successCbCallCount = 0,
                _errorCbCallCount = 0,
                db = {
                    all: function (options, cb) {
                        _options = options;
                        dbCallCount += 1;
                        if (dbCallCount === 1) {
                            cb(undefined, [
                                { doc: { _id: 'a' } },
                                { doc: { _id: 'b' } },
                                { doc: { _id: 'c' } } ]);
                        } else if (dbCallCount === 2) {
                            cb(undefined, [ { doc: { _id: 'c' } } ]);
                        } else {
                            assert.fail('Should not call all twice.');
                        }
                    }
                },
                process = function (result) {
                    _result = result;
                },
                finish = function () {
                    _finishCallCount = 1;
                },
                successCb = function (docs, err) {
                    _successCbCallCount = 1;
                },
                errorCb = function (docs, res) {
                    _errorCbCallCount = 1;
                },
                stool = new Stool({ db: db, batchSize: 1 });
            stool.iterate({
                startKeyDocId: undefined,
                endKeyDocId: 'z',
                pageSize: 2,
                numPages: -1 }, process, finish);
            // options and result from the last call
            assert.isTrue(_options.include_docs);
            assert.equal(_options.limit, 3);
            assert.equal(_options.startkey_docid, 'c');
            assert.equal(_options.endkey_docid, 'z');
            assert.equal(_result.length, 1);
            assert.equal(_result[0].doc._id, 'c');
            assert.equal(dbCallCount, 2);
            assert.equal(_finishCallCount, 1);
            assert.equal(_successCbCallCount, 0);
            assert.equal(_errorCbCallCount, 0);
        },
        'should call all once when num pages is 1 even though result is more than page size':
        function (topic) {
            var _result,
                _options,
                dbCallCount = 0,
                _finishCallCount = 0,
                _successCbCallCount = 0,
                _errorCbCallCount = 0,
                db = {
                    all: function (options, cb) {
                        _options = options;
                        dbCallCount += 1;
                        if (dbCallCount === 1) {
                            cb(undefined, [
                                { doc: { _id: 'a' } },
                                { doc: { _id: 'b' } },
                                { doc: { _id: 'c' } } ]);
                        } else {
                            assert.fail('Should not call all once.');
                        }
                    }
                },
                process = function (result) {
                    _result = result;
                },
                finish = function () {
                    _finishCallCount = 1;
                },
                successCb = function (docs, err) {
                    _successCbCallCount = 1;
                },
                errorCb = function (docs, res) {
                    _errorCbCallCount = 1;
                },
                stool = new Stool({ db: db, batchSize: 1 });
            stool.iterate({
                    startKeyDocId: undefined,
                    endKeyDocId: undefined,
                    pageSize: 2,
                    numPages: 1 },
                    process, finish);
            // options and result from the last call
            assert.isTrue(_options.include_docs);
            assert.equal(_options.limit, 3);
            assert.isUndefined(_options.startkey_docid);
            assert.isUndefined(_options.endkey_docid);
            assert.equal(_result.length, 3);
            assert.equal(_result[0].doc._id, 'a');
            assert.equal(dbCallCount, 1);
            assert.equal(_finishCallCount, 1);
            assert.equal(_successCbCallCount, 0);
            assert.equal(_errorCbCallCount, 0);
        }
    },
    'save': {
        'should call error callback when an error occured': function (topic) {
            var _docs, _err, callCount,
                db = {
                    'save': function (docs, cb) {
                        _docs = docs;
                        cb({ 'message': 'some error' }, undefined);
                    }
                },
                stool = new Stool({ db: db, batchSize: 1 });
            callCount = stool.save({ _id: 'abc', _rev: '123', blah: 'foobar' },
                undefined,
                function (docs, err) {
                    _err = err;
                });
            assert.equal(callCount, 1);
            assert.equal(_docs.length, 1);
            assert.equal(_docs[0]._id, 'abc');
            assert.equal(_docs[0]._rev, '123');
            assert.isUndefined(_docs[0]._deleted);
            assert.equal(_docs[0].blah, 'foobar');
            assert.equal(_err.message, 'some error');
        },
        'should call success callback when no error occured': function (topic) {
            var _docs, _res, callCount,
                db = {
                    'save': function (docs, cb) {
                        _docs = docs;
                        cb(undefined, { 'message': 'success' });
                    }
                },
                stool = new Stool({ db: db, batchSize: 1 });
            callCount = stool.save({ _id: 'abc', _rev: '123', blah: 'foobar' },
                function (docs, res) {
                    _res = res;
                },
                undefined);
            assert.equal(callCount, 1);
            assert.equal(_docs.length, 1);
            assert.equal(_docs[0]._id, 'abc');
            assert.equal(_docs[0]._rev, '123');
            assert.isUndefined(_docs[0]._deleted);
            assert.equal(_docs[0].blah, 'foobar');
            assert.equal(_res.message, 'success');
        }
    },
    'remove': {
        'should call error callback when an error occured': function (topic) {
            var _docs, _err, callCount,
                db = {
                    'save': function (docs, cb) {
                        _docs = docs;
                        cb({ 'message': 'some error' }, undefined);
                    }
                },
                stool = new Stool({ db: db, batchSize: 1 });
            callCount = stool.remove({ _id: 'abc', _rev: '123', blah: 'foobar' },
                undefined,
                function (docs, err) {
                    _err = err;
                });
            assert.equal(callCount, 1);
            assert.equal(_docs.length, 1);
            assert.equal(_docs[0]._id, 'abc');
            assert.equal(_docs[0]._rev, '123');
            assert.isTrue(_docs[0]._deleted);
            assert.equal(_docs[0].blah, 'foobar');
            assert.equal(_err.message, 'some error');
        },
        'should call success callback when no error occured': function (topic) {
            var _docs, _res, callCount,
                db = {
                    'save': function (docs, cb) {
                        _docs = docs;
                        cb(undefined, { 'message': 'success' });
                    }
                },
                stool = new Stool({ db: db, batchSize: 1 });
            callCount = stool.remove({ _id: 'abc', _rev: '123', blah: 'foobar' },
                function (docs, res) {
                    _res = res;
                },
                undefined);
            assert.equal(callCount, 1);
            assert.equal(_docs.length, 1);
            assert.equal(_docs[0]._id, 'abc');
            assert.equal(_docs[0]._rev, '123');
            assert.isTrue(_docs[0]._deleted);
            assert.equal(_docs[0].blah, 'foobar');
            assert.equal(_res.message, 'success');
        }
    }
}).exportTo(module);
