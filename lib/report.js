var log4js = require('log4js')(),
    logger = log4js.getLogger('couchtato');
log4js.addAppender(log4js.consoleAppender());
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
Report.prototype.finish = function (date) {
    this.finishDate = date;
    logger.info(this.toString(this.summary()));
};
Report.prototype.success = function (key, doc) {
    this.successes.push({ key: key, doc: doc });
    logger.info('Success ' + key + ' for doc ID ' + doc._id);
};
Report.prototype.error = function (key, doc, error) {
    this.errors.push({ key: key, doc: doc, error: error });
    logger.error('Error ' + key + ' for doc ID ' + doc._id + ' with error ' + error);
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