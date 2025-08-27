
MODULE = (function (mod) {

    mod.DateTime = class extends Date {
        get dateString() {
            return this.toISOString().substring(0, 10);
        }

        sameDateAs(other) {
            return (
                this.toISOString().substring(0, 10) ==
                other.toISOString().substring(0, 10)
            );
        }

        beforeDate(other) {
            if (
                this.sameDateAs(other) ||
                this.getFullYear() > other.getFullYear() ||
                this.getMonth() > other.getMonth() ||
                this.getDay() > other.getDay()
            ) {
                return false;
            }
            return true;
        }

        afterDate(other) {
            return !this.beforeDate(other) && !this.sameDateAs(other);
        }

        sameTimeAs(other, compareSeconds = false) {
            const substrEnd = compareSeconds ? 19 : 16;
            return (
                this.toISOString().substring(10, substrEnd) ==
                other.toISOString().substring(10, substrEnd)
            );
        }

        beforeTime(other, compareSeconds = false) {
            if (
                this.sameTimeAs(other, compareSeconds) ||
                this.getHours() > other.getHours() ||
                this.getMinutes() > other.getMinutes()
            ) {
                return false;
            }
            const isBefore = compareSeconds
                ? this.getSeconds() > other.getSeconds()
                : true;
            return isBefore;
        }

        afterTime(other, compareSeconds = false) {
            return (
                !this.sameTimeAs(other, compareSeconds) &&
                !this.beforeTime(other, compareSeconds)
            );
        }

        sameDateTimeAs(other, compareSeconds = false) {
            return this.sameDateAs(other) && this.sameTimeAs(other, compareSeconds);
        }

        beforeDateTime(other, compareSeconds = false) {
            return (
                !this.sameDateTimeAs(other, compareSeconds) && !this.afterDate(other)
            );
        }

        afterDateTime(other, compareSeconds = false) {
            return (
                !this.sameDateTimeAs(other, compareSeconds) &&
                !this.beforeDateTime(other, compareSeconds)
            );
        }
    }

    function getEarliestOf(one, two) {
        return one.beforeDateTime(two) ? one : two;
    }

    function getLatestOf(one, two) {
        return one.beforeDateTime(two) ? two : one;
    }

    mod.Duration = class {
        _start;
        _end;

        constructor(start, end) {
            if (!start.beforeDateTime(end)) {
                throw new Error("Start of Duration must be before end of Duration.");
            }
            this._start = start;
            this._end = end;
        }

        get start() {
            return this._start;
        }

        get end() {
            return this._end;
        }

        existsOverlapWith(other) {
            return !(
                !this.start.beforeDateTime(other.end) ||
                !this.end.afterDateTime(other.start)
            );
        }

        getOverlap(other) {
            if (this.existsOverlapWith(other)) {
                return new mod.Duration(
                    getLatestOf(this.start, other.start),
                    getEarliestOf(this.end, other.end)
                );
            }
            return false;
        }

        isEmpty() {
            return this.start.sameDateTimeAs(this.end);
        }
    }

    function getEarliestOf(one, two) {
        return one.beforeDateTime(two) ? one : two;
    }

    function getLatestOf(one, two) {
        return one.beforeDateTime(two) ? two : one;
    }

    mod.today = function () {
        return new Date().toISOString().substring(0, 10);
    }

    mod.parseDate = function (dateString) {
        let date =
            dateString.substring(0, 4) +
            "-" +
            dateString.substring(4, 6) +
            "-" +
            dateString.substring(6, 11) +
            ":" +
            dateString.substring(11, 13) +
            ":" +
            dateString.substring(13);
        return new mod.DateTime(Date.parse(date));
    }

    return mod;
}(MODULE));
