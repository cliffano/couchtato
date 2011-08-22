var cradle = require('cradle'),
    url = require('url');
    
var Stool = function (options) {
    if (options.url) {
        var u = url.parse(options.url), dbOptions = { cache: false };
        if (u.auth) {
            dbOptions.auth = { username: u.auth.split(':')[0], password: u.auth.split(':')[1] };
        }
        this.database = new(cradle.Connection)(
                u.protocol + '//' + u.hostname,
                u.port || 80,
                dbOptions
            ).database(u.pathname.replace(/^\//, ''));
    } else {
        this.database = options.db;
    }
    this.options = options;
    this.pageNum = 0;
    this.saveQueue = [];
    this.removeQueue = [];
};
Stool.prototype.driver = function () {
    return this.database;
};
Stool.prototype._save = function (docs, successCb, errorCb) {
    this.database.save(docs.concat([]), function (err, res) {
        if (err) {
            errorCb(docs, err);
        } else {
            successCb(docs, res);
        }
    });    
};
// recursively iterate through the documents with linked list pagination
Stool.prototype.iterate = function (startKeyDocId, endKeyDocId, pageSize, numPages, processCb, finishCb, successCb, errorCb) {
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
            that.iterate(startKeyDocId, endKeyDocId, pageSize, numPages, processCb, finishCb, successCb, errorCb);
        // last page
        } else {
            if (that.saveQueue.length > 0) {
                that._save(that.saveQueue, successCb, errorCb);
            }
            if (that.removeQueue.length > 0) {
                that._save(that.removeQueue, successCb, errorCb);
            }
            console.log('Finished processing all documents');
            finishCb();
        }
    });
};
Stool.prototype.save = function (doc, successCb, errorCb) {
    this.saveQueue.push(doc);
    if (this.saveQueue.length >= this.options.batchSize) {
        this._save(this.saveQueue, successCb, errorCb);
        this.saveQueue = [];
    }
    return (this.saveQueue.length === 0) ? 1 : 0;
};
Stool.prototype.remove = function (doc, successCb, errorCb) {
    doc._deleted = true;
    this.removeQueue.push(doc);
    if (this.removeQueue.length >= this.options.batchSize) {
        this._save(this.removeQueue, successCb, errorCb);
        this.removeQueue = [];
    }
    return (this.removeQueue.length === 0) ? 1 : 0;
};

exports.Stool = Stool;