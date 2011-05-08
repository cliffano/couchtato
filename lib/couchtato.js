// the lazy couch potato flipping through the channels on TV
var Couchtato = function (options, stool) {
    console.log('Couchtato is relaxed...');
    this.options = options;
    this.stool = stool;
};
// recursively iterate through the documents with linked list pagination
Couchtato.prototype.iterate = function (startKeyDocId) {
    console.log('Processing ' + this.options.pageSize + ' docs starting from ' + startKeyDocId);
    var that = this;
    this.stool.driver().all({'include_docs': true, 'limit': this.options.pageSize + 1, 'startkey_docid': startKeyDocId}, function (err, result) {
        if (err) {
            throw err;
        }
        var i, ln = result.length, pageSize = that.options.pageSize, type, task;
        for (i = 0; i < ln && i < pageSize; i += 1) {
            for (task in that.options.tasks) {
                if (that.options.tasks.hasOwnProperty(task)) {
                    that.options.tasks[task](that.stool, result[i].doc);
                }
            }
        }
        // continue to next page
        if (ln === that.options.pageSize + 1) {
            startKeyDocId = result[ln - 1].doc._id;
            that.iterate(startKeyDocId);
        // last page
        } else {
            console.log('Finished processing all documents');
        }
    });
};

exports.Couchtato = Couchtato;