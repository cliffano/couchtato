var log4js = require('log4js')(),
    logger = log4js.getLogger('couchtato');
log4js.addAppender(log4js.consoleAppender());
log4js.addAppender(log4js.fileAppender('couchtato.log'), 'couchtato');

var Report = function () {
    this.successes = [];
    this.errors = [];
    this.counts = {};
};
Report.prototype.start = function (date) {
    this.startDate = date;
    logger.info('================================================');
    logger.info('Couchtato is relaxed...');
    logger.info('Starting at ' + this.startDate.toString());
};
Report.prototype.finish = function (date) {
    this.finishDate = date;
    logger.info('Finishing at ' + this.startDate.toString());
    logger.info(this.toString(this.summary()));
};
Report.prototype.success = function (key, doc) {
    this.successes.push({ key: key, doc: doc });
    this.count('couchtato_success');
    logger.info('Success ' + key + ' for doc ID ' + doc._id);
};
Report.prototype.error = function (key, doc, error) {
    this.errors.push({ key: key, doc: doc, error: error });
    this.count('couchtato_error');
    logger.error('Error ' + key + ' for doc ID ' + doc._id + ' with error ' + error);
};
Report.prototype.count = function (key) {
    if (this.counts.hasOwnProperty(key)) {
        this.counts[key] += 1;
    } else {
        this.counts[key] = 1;
    }
};
Report.prototype.summary = function () {
    var summary = [], item;
    summary.push('+-----------------------------------------------+');
    summary.push('|                    REPORT                     |');
    summary.push('+-----------------------------------------------+');
    summary.push('START: ' + ((this.startDate) ? this.startDate.toString() : undefined));
    summary.push('FINISH: ' + ((this.finishDate) ? this.finishDate.toString() : undefined));
    for (item in this.counts) {
        if (this.counts.hasOwnProperty(item)) {
            summary.push('\t' + item + ': ' + this.counts[item]);
        }
    }
    summary.push('+-----------------------------------------------+');
    return summary;
};
Report.prototype.toString = function (summary) {
    summary.unshift('');
    return summary.join('\n');
};

exports.Report = Report;