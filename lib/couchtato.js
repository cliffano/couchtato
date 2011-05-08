// the lazy couch potato flipping through the channels on TV
var Couchtato = function (options, stool) {
    console.log('Couchtato is relaxed...');
    this.options = options;
    this.stool = stool;
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
        };
    this.stool.iterate(startKeyDocId, this.options.pageSize, process);
};

exports.Couchtato = Couchtato;