// the lazy couch potato flipping through the channels on TV
var Couchtato = function (options, stool, report) {
    console.log('Couchtato is relaxed...');
    this.options = options;
    this.stool = stool;
    this.report = report;
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
            that.report.finish(new Date());
            console.log(that.report.toString('================================================'));
        };
    this.report.start(new Date());
    this.stool.iterate(startKeyDocId, this.options.pageSize, process, finish);
};

exports.Couchtato = Couchtato;