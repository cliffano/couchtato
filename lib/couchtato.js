// the lazy couch potato flipping through the channels on TV
var Couchtato = function (options, stool, report) {
    this.options = options;
    this.stool = stool;
    this.report = report;
    this.calls = 0;
};
Couchtato.prototype.iterate = function () {
    var that = this,
        process = function (result) {
            var i, ln = result.length, task;
            for (i = 0; i < ln && i < that.options.pageSize; i += 1) {
                for (task in that.options.tasks) {
                    if (that.options.tasks.hasOwnProperty(task)) {
                        that.options.tasks[task](that, result[i].doc);
                    }
                }
            }
        },
        finish = function () {
            that.report.finish(new Date(), that.calls);
        },
        successCb = function (docs) {
            that.report.success('flush', docs);
            that.calls += 1;
        },
        errorCb = function (docs, err) {
            that.report.error('flush', docs, err);
            that.calls += 1;
        };
    this.report.start(new Date(), this.options.url);
    this.stool.iterate(this.options.startKey, this.options.endKey, this.options.pageSize, this.options.numPages, process, finish, successCb, errorCb);
};
Couchtato.prototype.save = function (doc) {
    var key = 'save',
        that = this,
        successCb = function (docs) {
            that.report.success(key, docs);
        },
        errorCb = function (docs, err) {
            that.report.error(key, docs, err);
        };
    this.calls += this.stool.save(doc, successCb, errorCb);
};
Couchtato.prototype.remove = function (doc) {
    var key = 'remove',
        that = this,
        successCb = function (docs) {
            that.report.success(key, docs);
        },
        errorCb = function (docs, err) {
            that.report.error(key, docs, err);
        };
    this.calls += this.stool.remove(doc, successCb, errorCb);
};
Couchtato.prototype.count = function (key) {
    this.report.count(key);
};
Couchtato.prototype.log = function (message) {
    this.report.log(message);
};

exports.Couchtato = Couchtato;