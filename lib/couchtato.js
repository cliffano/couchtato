var cradle = require('cradle'),
    fs = require('fs');

var Couchtato = function (options) {
    console.log('Couchtato is relaxed...');
    this.options = options;
}
// recursively iterate through the documents with linked list pagination
Couchtato.prototype.iterate = function (startKeyDocId) {
    console.log('Processing ' + this.options.pageSize + ' docs starting from ' + startKeyDocId);
    db.all({'include_docs': true, 'limit': pageSize + 1, 'startkey_docid': startKeyDocId}, function (err, result) {
        if (err) throw err;
        var i, ln = result.length, type;
        for (i = 0; i < ln && i < pageSize; i++) {
            for (task in this.options.tasks) {
                if (this.options.tasks.hasOwnProperty(task)) {
                    this.options.tasks[task].fn(db, result[i].doc);
                }
            }
        }
        // continue to next page
        if (ln === pageSize + 1) {
            startKeyDocId = result[ln - 1].doc._id;
            this.iterate(startKeyDocId);
        // last page
        } else {
            console.log('Finished processing all documents');
        }
    });
};

exports.Couchtato = Couchtato;