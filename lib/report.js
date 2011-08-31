var log4js = require('log4js'),
    logger = log4js.getLogger('couchtato');
log4js.addAppender(log4js.fileAppender('couchtato.log'), 'couchtato');

var Report = function () {
    this.successes = [];
    this.errors = [];
    this.counts = {};
};
Report.prototype.start = function (date, url) {
    this.startDate = date;
    logger.info('================================================');
    logger.info('Couchtato is relaxed...');
    logger.info('Using database URL ' + url);
};
// keep nextTick-ing until all calls are completed
Report.prototype._finish = function (calls) {
    var that = this;
    if (this.successes.length + this.errors.length < calls) {
        process.nextTick(function () {
            that._finish(calls);
        });
    } else {
        logger.info(this.toString(this.summary()));
    }
};
Report.prototype.finish = function (date, calls) {
    this.finishDate = date;
    this._finish(calls);
};
Report.prototype._getKey = function (doc) {
    return (doc._deleted === true) ? 'remove' : 'save';
};
Report.prototype.success = function (docs) {
    var key = this._getKey(docs[0]);
    this.successes.push({ key: key, docs: docs });
    logger.info('Success ' + key + ' for ' + docs.length + ' documents');
};
Report.prototype.error = function (docs, error) {
    var key = this._getKey(docs[0]);
    this.errors.push({ key: key, docs: docs, error: error });
    logger.error('Error ' + key + ' for ' + docs.length + ' documents with error ' + error);
};
Report.prototype.count = function (key) {
    if (this.counts.hasOwnProperty(key)) {
        this.counts[key] += 1;
    } else {
        this.counts[key] = 1;
    }
};
Report.prototype.log = function (message) {
    logger.info(message);
};
Report.prototype.summary = function () {
    var summary = [], item, hasCount = false;
    summary.push('------------------------------------------------');
    summary.push('Start date: ' + ((this.startDate) ? this.startDate.toString() : undefined));
    summary.push('Finish date: ' + ((this.finishDate) ? this.finishDate.toString() : undefined));
    summary.push(this.successes.length + ' successes, ' + this.errors.length + ' errors');
    for (item in this.counts) {
        if (this.counts.hasOwnProperty(item)) {
            if (!hasCount) {
                summary.push('Counts:');
                hasCount = true;
            }
            summary.push('\t- ' + item + ': ' + this.counts[item]);
        }
    }
    return summary;
};
Report.prototype.toString = function (summary) {
    summary.unshift('');
    return summary.join('\n');
};

exports.Report = Report;
