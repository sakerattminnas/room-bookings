export class DateTime extends Date {

  get dateString(): string {
    return this.toISOString().substring(0, 10);
  }

  sameDateAs(other: Date): boolean {
    return (
      this.toISOString().substring(0, 10) ==
      other.toISOString().substring(0, 10)
    );
  }

  beforeDate(other: Date): boolean {
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

  afterDate(other: Date): boolean {
    return !this.beforeDate(other) && !this.sameDateAs(other);
  }

  sameTimeAs(other: Date, compareSeconds: boolean = false): boolean {
    const substrEnd = compareSeconds ? 19 : 16;
    return (
      this.toISOString().substring(10, substrEnd) ==
      other.toISOString().substring(10, substrEnd)
    );
  }

  beforeTime(other: Date, compareSeconds: boolean = false) {
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

  afterTime(other: Date, compareSeconds: boolean = false) {
    return (
      !this.sameTimeAs(other, compareSeconds) &&
      !this.beforeTime(other, compareSeconds)
    );
  }

  sameDateTimeAs(other: DateTime, compareSeconds: boolean = false): boolean {
    return this.sameDateAs(other) && this.sameTimeAs(other, compareSeconds);
  }

  beforeDateTime(other: DateTime, compareSeconds: boolean = false): boolean {
    return (
      !this.sameDateTimeAs(other, compareSeconds) &&
      !this.afterDate(other)
    ) 
  }

  afterDateTime(other: DateTime, compareSeconds: boolean = false): boolean {
    return (
      !this.sameDateTimeAs(other, compareSeconds) &&
      !this.beforeDateTime(other, compareSeconds)
    );
  }

}

function getEarliestOf(one: DateTime, two: DateTime): DateTime {
    return one.beforeDateTime(two) ? one : two;
}

function getLatestOf(one: DateTime, two: DateTime): DateTime {
    return one.beforeDateTime(two) ? two : one;
}

export class Duration {
  _start: DateTime;
  _end: DateTime;

  constructor(start: DateTime, end: DateTime) {
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

  existsOverlapWith(other: Duration): boolean {
    return !(
        !this.start.beforeDateTime(other.end)
        || !this.end.afterDateTime(other.start)
    )
  }

  getOverlap(other: Duration): Duration | false {
    if (this.existsOverlapWith(other)) {
        return new Duration(
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

export function today(): string {
  return new Date().toISOString().substring(0, 10);
}
