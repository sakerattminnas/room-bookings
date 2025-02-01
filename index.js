window.onload = () => {
  addRooms();
  let dateInput = document.getElementById("date");
  dateInput.defaultValue = today();
};

const ROOMS = new Map([
  [
    "b",
    [
      "SU00",
      "SU01",
      "SU02",
      "SU03",
      "SU04",
      "SU10",
      "SU11",
      "SU12",
      "SU13",
      "SU14",
      "SU15",
      "SU17",
      "SU24",
      "SU25",
      "Olympen",
      "Egypten",
      "Asgård",
    ],
  ],
]);

function addRooms() {
  let timeTable = document.getElementById("timetable")?.children[0];

  ROOMS.forEach((rooms, key) => {
    rooms.forEach((room) => {
      let tr = document.createElement("tr");
      let td = document.createElement("td");
      tr.className = "row " + key + " " + room;
      let specialName = room.match(/SU(15|17)/);
      if (specialName) {
        room = room + "/" + (parseInt(specialName[1]) + 1);
      }
      td.innerText = room;
      tr.appendChild(td);

      for (let i = 0; i < 6; i++) {
        let td2 = document.createElement("td");
        tr.appendChild(td2);
      }

      timeTable.appendChild(tr);
    });
  });
}

class DateTime extends Date {
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

class Duration {
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

function today() {
  return new Date().toISOString().substring(0, 10);
}

function eventsAtDate(date, icalEvents) {
  const events = new Array();
  if (icalEvents) {
    icalEvents.forEach((ev) => {
      if (date.sameDateAs(ev.start) || date.sameDateAs(ev.end)) {
        events.push(ev);
      }
    });
  }
  return events;
}

function getRoomsBookedAt(events) {
  let result = new Map();
  events.forEach((event) => {
    try {
      const eventDuration = new Duration(event.start, event.end);
      event.location.forEach((room) => {
        const oldDurations = result.get(room) || new Set();
        const newDurations = new Set([eventDuration, ...oldDurations]);
        result.set(room, newDurations);
      });
    } catch (ex) {
      console.log(`start=${event.start}, end=${event.end}`, ex);
      throw "Error";
    }
  });
  return result;
}

function extractEvents(ical) {
  if (!ical) {
    return new Array();
  }
  const eventRegex = new RegExp("BEGIN:VEVENT.+?END:VEVENT", "gsu");
  const m = ical.match(eventRegex);
  if (m) {
    return m;
  } else {
    return new Array();
  }
}

function parseDate(dateString) {
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
  return new DateTime(Date.parse(date));
}

function stringToEvent(icalEventString) {
  const start = icalEventString.match(new RegExp("DTSTART:(.+)", "u"));
  const end = icalEventString.match(new RegExp("DTEND:(.+)", "u"));
  const summary = icalEventString.match(
    new RegExp("SUMMARY:(.+?)\nLOCATION", "us")
  );
  const description = icalEventString.match(
    new RegExp("DESCRIPTION:(.+?)\nEND:VEVENT", "us")
  );
  const locationMatch = icalEventString.match(
    new RegExp("LOCATION:(.+?)\nDESCRIPTION", "us")
  );

  if (start === null || end === null) {
    return null;
  }

  let desc = "";
  if (description !== null) {
    desc = description[1];
    desc = desc.replaceAll("\\n", "\n");
  }

  let summ = "";
  let courses = new Set();
  if (summary !== null) {
    summ = summary[1];
    summ = summ.replaceAll("\\n", "\n");
    summ = summ.replaceAll("\\", "");

    let matchedCourses = summ
      .matchAll(new RegExp("([A-Z0-9]{6})", "g"))
      .toArray();

    if (matchedCourses.length === 0) {
      matchedCourses = new Array(["ÖVR"]);
    }

    matchedCourses.forEach((val) =>
      val.forEach((entry) => {
        courses.add(entry);
      })
    );
  }

  let rooms = new Set();
  if (locationMatch !== null) {
    let locString = locationMatch[1] + ";";
    locString = locString.replaceAll("\\n", ";");
    locString = locString.replace(new RegExp("[\n \r]+", "g"), "");

    let locStringMatch = locString.matchAll(
      new RegExp("Lokal:([A-Za-zÅÄÖåäö0-9/]+)[\n;]", "gu")
    );

    let nextMatch = locStringMatch.next();
    while (!nextMatch.done) {
      let room = nextMatch.value[1].split("/")[0];
      if (ROOMS.get("b").find((r) => r === room)) {
        rooms.add(room);
      }
      nextMatch = locStringMatch.next();
    }
  }

  return {
    start: parseDate(start[1]),
    end: parseDate(end[1]),
    summary: summ,
    location: Array.from(rooms),
    description: desc,
    courses: Array.from(courses),
  };
}

function icalToJSON(ical) {
  if (ical) {
    ical = ical.replaceAll("\r", "");
    let eventsStrings = extractEvents(ical);
    if (eventsStrings === null) {
      console.log("No events found.");
      return new Array();
    }

    let events = new Array();

    eventsStrings.forEach((eventString) => {
      let ev = stringToEvent(eventString);
      if (ev !== null) {
        events.push(ev);
      }
    });

    console.log("Finished fetching events.");
    return events;
  }
  return "";
}

const URL =
  "https://cloud.timeedit.net/liu/web/schema/ri680Q18Y99Z69Q5X4839196y1Z6589X" +
  "X462189Q6178886X5918XXX989986918886X6X888878118186651886XX10999916X18766Q6" +
  "8Z08198l591y169ob8Xl8Q98mycXl05X668X98u5Z10QlZZ6LRd95n0ocWqUp55cyWnL5jW859" +
  "23%C3%A40QWdwW7aXQyamaSvZoXhZnQ6905.ics";

async function getIcal() {
  fetch(URL)
    .then((response) => {
      return response.body;
    })
    .then((rb) => {
      if (!rb) {
        return;
      }
      const reader = rb.getReader();

      return new ReadableStream({
        start(controller) {
          // The following function handles each data chunk
          function push() {
            // "done" is a Boolean and value a "Uint8Array"
            reader.read().then(({ done, value }) => {
              // If there is no more data to read
              if (done) {
                controller.close();
                return;
              }
              // Get the data and send it to the browser via the controller
              controller.enqueue(value);
              // Check chunks by logging to the console
              push();
            });
          }
          push();
        },
      });
    })
    .then((stream) =>
      // Respond with our stream
      new Response(stream, { headers: { "Content-Type": "text/html" } }).text()
    )
    .then((result) => {
      // Do things with result
      const info = document.getElementById("info");
      const infodate = document.getElementById("infodate");
      const date = document.getElementById("date");
      let events = eventsAtDate(getInputDate(), icalToJSON(result));
      if (!events) {
        return;
      }
      let rows = document.getElementsByClassName("row");
      Array.from(rows).forEach((row) => {
        for (let i = 1; i < row.children.length; i++) {
          const elem = row.children[i];
          elem.innerText = "";
        }
      });
      events.forEach((event) => {
        const timeSlots = getTimeSlotIndex(
          event.start.getHours(),
          event.end.getHours()
        );
        event.location.forEach((loc) => {
          const cells = document.querySelector("." + loc)?.children;
          if (cells) {
            Array.from(cells).forEach((cell, index) => {
              if (timeSlots.includes(index)) {
                cell.innerText = pickCourseCode(event.courses);
              }
            });
          }
        });
      });
      infodate.innerText = date.value;
      info.classList = "";
    })
    .catch((e) => console.log(e))
    .finally(() => setLoading(false));
}

function getInputDate() {
  const dateInput = document.getElementById("date");
  if (!dateInput || !(dateInput instanceof HTMLInputElement)) {
    return new DateTime(today());
  }
  return new DateTime(dateInput.value);
}

function handleRoomVisibility() {
  const cbs = document.getElementById("checkboxes");
  if (cbs) {
    const checkboxes = Array.from(cbs.children).filter(
      (elem) => elem instanceof HTMLInputElement
    );
    checkboxes.forEach((elem) => {
      const rooms = document.getElementsByClassName(elem.name);
      if (elem.checked) {
        Array.from(rooms).forEach((elem) => {
          if (elem.classList.contains("hidden")) {
            elem.classList.remove("hidden");
          }
        });
      } else {
        Array.from(rooms).forEach((elem) => {
          elem.classList.add("hidden");
        });
      }
    });
  }
}

function getTimeSlotIndex(startHour, endHour) {
  const timeSlotIndeces = [8, 10, 13, 15, 17, 19];
  let result = new Set();
  for (let i = 1; i < timeSlotIndeces.length; i++) {
    const timeSlotStart = timeSlotIndeces[i-1];
    const timeSlotEnd = timeSlotIndeces[i];

    if (startHour >= timeSlotStart && startHour < timeSlotEnd) {
      // if it starts within the range (not at the end of the range)
      result.add(timeSlotStart);
    }
    if (endHour > timeSlotStart && endHour <= timeSlotEnd) {
      // if it ends within the range (not at the start of the range)
      result.add(timeSlotStart);
    }
    if (startHour <= timeSlotStart && endHour >= timeSlotEnd) {
      // if it overlaps the range entirely
      result.add(timeSlotStart);
    }
  }
  return Array.from(result).map((val) => {
    if (val % 2) {
      return (val - 1) / 2 - 3;
    } else {
      return val / 2 - 3;
    }
  });
}

function pickCourseCode(courses) {
  const cs = courses.join("/");
  const tekfak = cs.match(new RegExp("T[A-Z]{3}[0-9]{2}"));
  if (tekfak) {
    return tekfak[0];
  }
  return cs.split("/")[0];
}

function setLoading(on) {
  let loader = document.getElementById("loader");
  if (on) {
    loader.classList = "";
  } else {
    loader.classList = "hidden";
  }
}

function handleSubmit() {
  setLoading(true);
  console.log("Fetching events");
  handleRoomVisibility();
  getIcal();
}
