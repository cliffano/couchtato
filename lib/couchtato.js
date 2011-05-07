var cradle = require('cradle'),
    fs = require('fs'),
    url = require('url');

var _createDb = function (_url) {
    var u = url.parse(_url);
    return new(cradle.Connection)(
            u.protocol + '//' + u.hostname,
            u.port || 80,
            (u.auth) ? { auth: { user: u.auth.split(':')[0], pass: u.auth.split(':')[1] } } : {}
        ).database(u.pathname.replace(/^\//, ''));
};

var Couchtato = function (options) {
    console.log('Couchtato is relaxed...');
    this.options = options;
    this.db = _createDb(this.options.url);
};
// recursively iterate through the documents with linked list pagination
Couchtato.prototype.iterate = function (startKeyDocId) {
    console.log('Processing ' + this.options.pageSize + ' docs starting from ' + startKeyDocId);
    var that = this;
    this.db.all({'include_docs': true, 'limit': this.options.pageSize + 1, 'startkey_docid': startKeyDocId}, function (err, result) {
        if (err) {
            throw err;
        }
        var i, ln = result.length, pageSize = that.options.pageSize, type, task;
        for (i = 0; i < ln && i < pageSize; i += 1) {
            for (task in that.options.tasks) {
                if (that.options.tasks.hasOwnProperty(task)) {
                    // TODO wrap db, but still expose db for custom use
                    that.options.tasks[task](that.db, result[i].doc);
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