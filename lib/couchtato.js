// the lazy couch potato flipping through the channels on TV
var Couchtato = function (options, stool, report) {
    this.options = options;
    this.stool = stool;
    this.report = report;
    this.calls = 0;
};
Couchtato.prototype.iterate = function (startKeyDocId) {
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
        };
    this.report.start(new Date(), this.options.url);
    this.stool.iterate(startKeyDocId, this.options.pageSize, this.options.numPages, process, finish);
};
Couchtato.prototype.save = function (doc) {
    var key = 'save',
        that = this,
        successCb = function (doc) {
            that.report.success(key, doc);
        },
        errorCb = function (err) {
            that.report.error(key, doc, err);
        };
    this.stool.save(doc, successCb, errorCb);
    this.calls += 1;
};
Couchtato.prototype.remove = function (doc) {
    var key = 'remove',
        that = this,
        successCb = function (doc) {
            that.report.success(key, doc);
        },
        errorCb = function (err) {
            that.report.error(key, doc, err);
        };
    this.stool.remove(doc, successCb, errorCb);
    this.calls += 1;
};
Couchtato.prototype.count = function (key) {
    this.report.count(key);
};
Couchtato.prototype.log = function (message) {
    this.report.log(message);
};

exports.Couchtato = Couchtato;