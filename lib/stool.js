var cradle = require('cradle'),
    url = require('url');
    
// utilities, a simple wrapper to cradle
var Stool = function (arg) {
    console.log('Stool is in position...');
    // TODO: avoid type checking?
    if (typeof arg === 'string') {
        var u = url.parse(arg);
        this.database = new(cradle.Connection)(
                u.protocol + '//' + u.hostname,
                u.port || 80,
                (u.auth) ? { auth: { user: u.auth.split(':')[0], pass: u.auth.split(':')[1] } } : {}
            ).database(u.pathname.replace(/^\//, ''));
    } else if (typeof arg === 'object')  {
        this.database = arg;
    } else {
        throw new Error('Unexpected Stool argument of type ' + (typeof arg));
    }
};
Stool.prototype.driver = function () {
    return this.database;
};
// recursively iterate through the documents with linked list pagination
Stool.prototype.iterate = function (startKeyDocId, pageSize, fn) {
    var that = this;
    this.database.all({'include_docs': true, 'limit': pageSize + 1, 'startkey_docid': startKeyDocId}, function (err, result) {
        if (err) {
            throw err;
        }
        fn(result);
        // continue to next page
        if (result.length === pageSize + 1) {
            startKeyDocId = result[result.length - 1].doc._id;
            that.iterate(startKeyDocId, pageSize, fn);
        // last page
        } else {
            console.log('Finished processing all documents');
        }
    });
};

exports.Stool = Stool;