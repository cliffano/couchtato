var Report = function () {
    this.successes = [];
    this.errors = [];
    this.counts = {};
};
Report.prototype.start = function (date) {
    this.startDate = date;
};
Report.prototype.finish = function (date) {
    this.finishDate = date;
    console.log(this.toString('================================================'));
};
Report.prototype.success = function (key, doc) {
    this.successes.push({ key: key, doc: doc });
    this.count('couchtato_success');
};
Report.prototype.error = function (key, doc, error) {
    this.errors.push({ key: key, doc: doc, error: error });
    this.count('couchtato_error');
};
Report.prototype.count = function (key) {
    if (this.counts.hasOwnProperty(key)) {
        this.counts[key] += 1;
    } else {
        this.counts[key] = 1;
    }
};
Report.prototype.summary = function () {
    return [
        'Start: ' + ((this.startDate) ? this.startDate.toString() : undefined),
        'Finish: ' + ((this.finishDate) ? this.finishDate.toString() : undefined)
        ];
};
Report.prototype.toString = function (line) {
    var summary = this.summary();
    summary.push(line);
    summary.unshift(line);
    return summary.join('\n');
};

exports.Report = Report;