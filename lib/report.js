var Report = function () {
};
Report.prototype.start = function (date) {
    this.startDate = date;
};
Report.prototype.finish = function (date) {
    this.finishDate = date;
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