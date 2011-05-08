var cradle = require('cradle'),
    url = require('url');
    
// utilities, a simple wrapper to cradle
var Stool = function (arg) {
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

exports.Stool = Stool;