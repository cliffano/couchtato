var cradle = require('cradle'),
    url = require('url');
    
var Stool = function (arg) {
    // TODO: avoid type checking?
    if (typeof arg === 'string') {
        var u = url.parse(arg), options = { cache: false };
        if (u.auth) {
            options.auth = { username: u.auth.split(':')[0], password: u.auth.split(':')[1] };
        }
        this.database = new(cradle.Connection)(
                u.protocol + '//' + u.hostname,
                u.port || 80,
                options
            ).database(u.pathname.replace(/^\//, ''));
    } else if (typeof arg === 'object')  {
        this.database = arg;
    } else {
        throw new Error('Unexpected Stool argument of type ' + (typeof arg));
    }
    this.pageNum = 0;
};
Stool.prototype.driver = function () {
    return this.database;
};
// recursively iterate through the documents with linked list pagination
Stool.prototype.iterate = function (startKeyDocId, endKeyDocId, pageSize, numPages, processCb, finishCb) {
    var that = this,
        params = {'include_docs': true, 'limit': pageSize + 1, 'startkey_docid': startKeyDocId};
    if (endKeyDocId) {
        params.endkey_docid = endKeyDocId;
    }
    this.database.all(params, function (err, result) {
        if (err) {
            throw new Error(err.error + ' - ' + err.reason);
        }
        that.pageNum += 1;
        console.log('Processing page ' + that.pageNum + ': ' + pageSize + ' docs from ID ' + startKeyDocId);
        processCb(result);
        // continue to next page
        if ((numPages === -1 || that.pageNum < numPages) && result.length === pageSize + 1) {
            startKeyDocId = result[result.length - 1].doc._id;
            that.iterate(startKeyDocId, endKeyDocId, pageSize, numPages, processCb, finishCb);
        // last page
        } else {
            console.log('Finished processing all documents');
            finishCb();
        }
    });
};
Stool.prototype.save = function (doc, successCb, errorCb) {
    this.database.save(doc._id, doc._rev, doc, function (err, res) {
        if (err) {
            errorCb(err);
        } else {
            successCb(res);
        }
    });
};
Stool.prototype.remove = function (doc, successCb, errorCb) {
    this.database.remove(doc._id, doc._rev,  function (err, res) {
        if (err) {
            errorCb(err);
        } else {
            successCb(res);
        }
    });
};

exports.Stool = Stool;