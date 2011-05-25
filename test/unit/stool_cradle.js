var assert = require('assert'),
    Stool = require('../../lib/stool/cradle').Stool,
    vows = require('vows');

vows.describe('Stool').addBatch({
    'driver when constructor arg is string': {
        topic: function () {
            return new Stool('http://localhost:5984/blah');
        },
        'should return Craddle db': function (topic) {
            var driver = topic.driver();
            assert.equal(driver.name, 'blah');
            assert.isFunction(driver.all);
            assert.isFunction(driver.save);
            assert.isFunction(driver.remove);
        }
    },
    'driver when constructor arg is an object': {
        topic: function () {
            return new Stool({ blah: 'blah' });
        },
        'should return the object itself': function (topic) {
            var driver = topic.driver();
            assert.isObject(driver);
            assert.equal(driver.blah, 'blah');
        }
    },
    'driver when constructor arg is non string and non object': {
        'should throw error': function (topic) {
            var stool;
            try {
                stool = new Stool(function () {});
                assert.fail('An error should have been thrown.');
            } catch (e) {
                assert.equal(e.message, 'Unexpected Stool argument of type function');
            }
        }
    },
    'iterate when database exists': {
        'should throw error when callback error is provided': function (topic) {
            var _result, _options, _finishCallCount = 0,
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
                stool = new Stool(db);
            try {
                stool.iterate(undefined, 2, process);
                assert.fail('An error should have been thrown.');
            } catch (e) {
                assert.equal(e.message, 'Danger! - Sharks');
            }
            assert.isTrue(_options.include_docs);
            assert.equal(_options.limit, 3);
            assert.isUndefined(_options.startkey_docid);
            assert.isUndefined(_result);
            assert.equal(_finishCallCount, 0);
        },
        'should call all once when result is empty': function (topic) {
            var _result, _options, _finishCallCount = 0,
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
                stool = new Stool(db);
            stool.iterate(undefined, 2, process, finish);
            assert.isTrue(_options.include_docs);
            assert.equal(_options.limit, 3);
            assert.isUndefined(_options.startkey_docid);
            assert.equal(_result.length, 0);
            assert.equal(_finishCallCount, 1);
        },
        'should call all once when result is less than page size': function (topic) {
            var _result, _options, _finishCallCount,
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
                stool = new Stool(db);
            stool.iterate(undefined, 2, process, finish);
            assert.isTrue(_options.include_docs);
            assert.equal(_options.limit, 3);
            assert.isUndefined(_options.startkey_docid);
            assert.equal(_result.length, 1);
            assert.equal(_result[0].doc._id, 'a');
            assert.equal(_finishCallCount, 1);
        },
        'should call all once when result is exactly the page size': function (topic) {
            var _result, _options, _finishCallCount = 0,
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
                stool = new Stool(db);
            stool.iterate(undefined, 2, process, finish);
            assert.isTrue(_options.include_docs);
            assert.equal(_options.limit, 3);
            assert.isUndefined(_options.startkey_docid);
            assert.equal(_result.length, 2);
            assert.equal(_result[0].doc._id, 'a');
            assert.equal(_result[1].doc._id, 'b');
            assert.equal(_finishCallCount, 1);
        },
        'should call all twice when result is more than page size': function (topic) {
            var _result, _options, dbCallCount = 0, _finishCallCount = 0,
                db = {
                    all: function (options, cb) {
                        _options = options;
                        dbCallCount += 1;
                        if (dbCallCount === 1) {
                            cb(undefined, [ { doc: { _id: 'a' } }, { doc: { _id: 'b' } }, { doc: { _id: 'c' } } ]);
                        } else if (dbCallCount === 2) {
                            cb(undefined, [ { doc: { _id: 'c' } } ]);
                        } else {
                            assert.fail('Should not call all more than twice.');
                        }
                    }
                },
                process = function (result) {
                    _result = result;
                },
                finish = function () {
                    _finishCallCount = 1;
                },
                stool = new Stool(db);
            stool.iterate(undefined, 2, process, finish);
            // options and result from the last call
            assert.isTrue(_options.include_docs);
            assert.equal(_options.limit, 3);
            assert.equal(_options.startkey_docid, 'c');
            assert.equal(_result.length, 1);
            assert.equal(_result[0].doc._id, 'c');
            assert.equal(_finishCallCount, 1);
        }
    },
    'save': {
        'should call error callback when an error occured': function (topic) {
            var _id, _rev, _doc, _err,
                db = {
                    'save': function (id, rev, doc, cb) {
                        _id = id;
                        _rev = rev;
                        _doc = doc;
                        cb({ 'message': 'some error' }, undefined);
                    }
                },
                stool = new Stool(db);
            stool.save({ _id: 'abc', _rev: '123', blah: 'foobar' },
                undefined,
                function (err) {
                    _err = err;
                });
            assert.equal(_id, 'abc');
            assert.equal(_rev, '123');
            assert.equal(_doc.blah, 'foobar');
            assert.equal(_err.message, 'some error');
        },
        'should call success callback when no error occured': function (topic) {
            var _id, _rev, _doc, _res,
                db = {
                    'save': function (id, rev, doc, cb) {
                        _id = id;
                        _rev = rev;
                        _doc = doc;
                        cb(undefined, { 'message': 'success' });
                    }
                },
                stool = new Stool(db);
            stool.save({ _id: 'abc', _rev: '123', blah: 'foobar' },
                function (res) {
                    _res = res;
                },
                undefined);
            assert.equal(_id, 'abc');
            assert.equal(_rev, '123');
            assert.equal(_doc.blah, 'foobar');
            assert.equal(_res.message, 'success');
        }
    },
    'remove': {
        'should call error callback when an error occured': function (topic) {
            var _id, _rev, _err,
                db = {
                    'remove': function (id, rev, cb) {
                        _id = id;
                        _rev = rev;
                        cb({ 'message': 'some error' }, undefined);
                    }
                },
                stool = new Stool(db);
            stool.remove({ _id: 'abc', _rev: '123', blah: 'foobar' },
                undefined,
                function (err) {
                    _err = err;
                });
            assert.equal(_id, 'abc');
            assert.equal(_rev, '123');
            assert.equal(_err.message, 'some error');
        },
        'should call success callback when no error occured': function (topic) {
            var _id, _rev, _res,
                db = {
                    'remove': function (id, rev, cb) {
                        _id = id;
                        _rev = rev;
                        cb(undefined, { 'message': 'success' });
                    }
                },
                stool = new Stool(db);
            stool.remove({ _id: 'abc', _rev: '123', blah: 'foobar' },
                function (res) {
                    _res = res;
                },
                undefined);
            assert.equal(_id, 'abc');
            assert.equal(_rev, '123');
            assert.equal(_res.message, 'success');
        }
    }
}).export(module);