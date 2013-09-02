var buster = require('buster'),
  log4js = require('log4js'),
  Util = new require('../lib/util');

buster.testCase('util - util', {
  setUp: function () {
    this.mockLog4js = this.mock(log4js);
    this.spySetLevel = this.spy();
    this.spyInfo = this.spy();

    this.mockLog4js.expects('loadAppender').once().withExactArgs('file');
    this.stub(log4js, 'appenders', {
      file: function (file) {
        assert.equals(file, 'couchtato.log');
      }
    });
    this.mockLog4js.expects('addAppender').once();
    this.mockLog4js.expects('getLogger').once().withExactArgs('').returns({ setLevel: this.spySetLevel, info: this.spyInfo });
    this.spySetLevel.calledWith('INFO');
  },
  'should set driver': function () {
    var util = new Util(null, null, 'somedriver');
    assert.equals(util.driver, 'somedriver');
  },
  'should increment key stat when increment is called': function () {
    var util = new Util();
    util.count('somekey');
    util.count('somekey');
    assert.equals(util.stat.somekey, 2);
  },
  'should increment key stat when increment is called and stat already has initial value': function () {
    var util = new Util({ somekey: 3 });
    util.count('somekey');
    util.count('somekey');
    assert.equals(util.stat.somekey, 5);
  },
  'should increment key counter when count is called': function () {
    var util = new Util();
    util.count('somekey1');
    util.count('somekey2');
    util.count('somekey1');
    util.count('somekey1');
    assert.equals(util.stat.somekey1, 3);
    assert.equals(util.stat.somekey2, 1);
  },
  'should count, and add doc to queue when save is called': function () {
    var util = new Util();
    util.save({ _id: 'someid' });
    assert.equals(util.stat._couchtato_save, 1);
    assert.equals(util.queue.length, 1);
    assert.equals(util.queue[0]._id, 'someid');
  },
  'should count, add doc to queue, and set document deleted property when remove is called': function () {
    var util = new Util();
    util.remove({ _id: 'someid' });
    assert.equals(util.stat._couchtato_remove, 1);
    assert.equals(util.queue.length, 1);
    assert.equals(util.queue[0]._id, 'someid');
    assert.isTrue(util.queue[0]._deleted);
  },
  'should log message using log4js when log is called': function () {
    var util = new Util();
    util.log('some message');
    assert.isTrue(this.spyInfo.calledWith('some message'));
  }
});