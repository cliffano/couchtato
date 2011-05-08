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
    },
    'iterate when database exists': {
        'should throw error when callback error is provided': function (topic) {
            var _result, _options,
                db = {
                    all: function (options, cb) {
                        _options = options;
                        cb(new Error('Danger!'), undefined);
                    }
                },
                process = function (result) {
                    _result = result;
                }
                stool = new Stool(db);
            try {
                stool.iterate(undefined, 2, process);
                assert.fail('An error should have been thrown.');
            } catch (e) {
                assert.equal(e.message, 'Danger!');
            }
            assert.isTrue(_options.include_docs);
            assert.equal(_options.limit, 3);
            assert.isUndefined(_options.startkey_docid);
            assert.isUndefined(_result);
        },
        'should call all once when result is empty': function (topic) {
            var _result, _options,
                db = {
                    all: function (options, cb) {
                        _options = options;
                        cb(undefined, []);
                    }
                },
                process = function (result) {
                    _result = result;
                }
                stool = new Stool(db);
            stool.iterate(undefined, 2, process);
            assert.isTrue(_options.include_docs);
            assert.equal(_options.limit, 3);
            assert.isUndefined(_options.startkey_docid);
            assert.equal(_result.length, 0);
        },
        'should call all once when result is less than page size': function (topic) {
            var _result, _options,
                db = {
                    all: function (options, cb) {
                        _options = options;
                        cb(undefined, [ { doc: { _id: 'a' } } ]);
                    }
                },
                process = function (result) {
                    _result = result;
                }
                stool = new Stool(db);
            stool.iterate(undefined, 2, process);
            assert.isTrue(_options.include_docs);
            assert.equal(_options.limit, 3);
            assert.isUndefined(_options.startkey_docid);
            assert.equal(_result.length, 1);
            assert.equal(_result[0].doc._id, 'a');
        },
        'should call all once when result is exactly the page size': function (topic) {
            var _result, _options,
                db = {
                    all: function (options, cb) {
                        _options = options;
                        cb(undefined, [ { doc: { _id: 'a' } }, { doc: { _id: 'b' } } ]);
                    }
                },
                process = function (result) {
                    _result = result;
                }
                stool = new Stool(db);
            stool.iterate(undefined, 2, process);
            assert.isTrue(_options.include_docs);
            assert.equal(_options.limit, 3);
            assert.isUndefined(_options.startkey_docid);
            assert.equal(_result.length, 2);
            assert.equal(_result[0].doc._id, 'a');
            assert.equal(_result[1].doc._id, 'b');
        },
        'should call all twice when result is more than page size': function (topic) {
            var _result, _options, dbCallCount = 0,
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
                }
                stool = new Stool(db);
            stool.iterate(undefined, 2, process);
            // options and result from the last call
            assert.isTrue(_options.include_docs);
            assert.equal(_options.limit, 3);
            assert.equal(_options.startkey_docid, 'c');
            assert.equal(_result.length, 1);
            assert.equal(_result[0].doc._id, 'c');
        }
    }
}).export(module);