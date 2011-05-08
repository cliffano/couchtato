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
                    iterate: function (startKeyDocId, pageSize, process) {
                        _startKeyDocId = startKeyDocId;
                        _pageSize = pageSize;
                        process([ { doc: { _id: 'a' } } ]);
                    }
                },
                couchtato = new Couchtato(options, stool);
            couchtato.iterate('abcdef');
            assert.equal(_startKeyDocId, 'abcdef');
            assert.equal(_pageSize, 99);
            assert.isFunction(_stool.iterate);
            assert.equal(_doc._id, 'a');
        }
    }
}).export(module);