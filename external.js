const relRooms = ["MUX1", "MUX2", "MUX3", "MUX4", "Asgård", "Boren", "Egypten", 
                  "Glan", "Hunn", "Olympen", "PC1", "PC2", "PC3", "PC4", "PC5", 
                  "Roxen", "SU00", "SU01", "SU02", "SU03", "SU04", "SU10", 
                  "SU11", "SU12", "SU13", "SU14", "SU15\/16", "SU17\/18", 
                  "SU24", "SU25"];
const relRoomsRegEx = /MUX[1-4]|Asgård|Boren|Egypten|Glan|Hunn|Olympen|PC[1-5]|Roxen|SU[0-1][0-5]|SU15\/16|SU17\/18/g;
const PCRoomsRegEx = /PC[1-5]/g;
const linuxRoomsRegEx = /MUX[1-4]|Asgård|Boren|Egypten|Glan|Hunn|Olympen|Roxen|SU00|SU01|SU02|SU03|SU04|SU10|SU11|SU12|SU13|SU14|SU15\/16|SU17\/18|SU24|SU25/g;
const minTime = 8;
const maxTime = 20;

function popupFunc(element) {
    var popup = element.children[1];
    popup.classList.toggle("show");
}

function setUp() {
    const dateControl = document.querySelector('input[type="date"]');
    let today = new Date();
    today.setDate(today.getDate() - 14);
    dateControl.min = today.toISOString().substring(0, 10);
    today.setDate(today.getDate() + 28);
    dateControl.max = today.toISOString().substring(0, 10);
    changeToTodaysDate();
    // addRoomCheckboxes();
}

function changeDate(dir) {
    const dateControl = document.querySelector('input[type="date"]');
    let theDate = dateControl.valueAsDate;
    if (dir == "+") {
        theDate.setUTCDate(theDate.getUTCDate() + 1);
    } else if (dir == "-") {
        theDate.setUTCDate(theDate.getUTCDate() - 1)
    }
    dateControl.value = theDate.toISOString().substring(0, 10);
    console.log("Setting date to " + dateControl.value);
}

function resetContent() {
    document.getElementById("timeline").innerHTML = "";
    document.getElementById("dateinfo").innerHTML = "";
    document.getElementById("data").innerHTML = "";
    document.getElementById("main-data").innerHTML = "";
    document.getElementById("room-div").innerHTML = "";
}

function resetAll() {
    resetContent();
    document.querySelector('input[type="date"]').value = "";
    // addRoomCheckboxes();
}

function prepareTable() {
    const timeline = document.getElementById("timeline");
    const table = document.createElement("table");
    table.id = "timeline-table";
    let tableRow = document.createElement("tr");
    let tableCol = document.createElement("th");
    tableCol.innerHTML = "Rum";
    tableRow.appendChild(tableCol);
    for (let time = minTime; time <= maxTime; time++) {
        let tableCol = document.createElement("th");
        tableCol.innerHTML = time;
        tableCol.innerText = tableCol.innerText;
        tableRow.appendChild(tableCol);
    }
    table.appendChild(tableRow);
    timeline.appendChild(table);
}

function timeInSpan(time, timesStr) {
    let inSpan = false;
    timesStr.forEach(t => {
        let start = parseInt(t.substr(0, 2));
        let end = parseInt(t.substr(3, 2));
        if (time >= start && time < end) {
            inSpan = true;
        }
    });
    return inSpan;
}

function addRoomTimelineTable(room, timesStr) {
    const timeline = document.getElementById("timeline-table");
    let tableRow = document.createElement("tr");
    let tableCol = document.createElement("td");
    tableCol.innerHTML = room;
    tableCol.className = "label";
    tableRow.appendChild(tableCol);

    for (let time = minTime; time <= maxTime; time++) {
        let tableCol = document.createElement("td");
        tableCol.className = "time-box";
        console.log(time + " in " + timesStr.join() + ": " + timeInSpan(time, timesStr));
        if (timeInSpan(time, timesStr) == true) {
            tableCol.classList.add("booked-time");
            if (room.match(PCRoomsRegEx)) {
                tableCol.classList.add("PC");
            }
        }
        tableRow.appendChild(tableCol);
    }

    timeline.appendChild(tableRow);
}

function addRoomCheckboxes() {
    let theForm = document.querySelector("div[id=room-div]");
    relRooms.forEach(room => {
        let d = document.createElement("div")
        let r = document.createElement("input");
        let l = document.createElement("label");
        d.className = "room-checkbox";
        l.for = room;
        l.innerText = room;
        r.type = "checkbox";
        r.id = room;
        r.value = room;
        r.name = room;
        r.checked = true;
        d.appendChild(r);
        d.appendChild(l);
        theForm.appendChild(d);
    });
}

function changeToTodaysDate() {
    const dateControl = document.querySelector('input[type="date"]');
    let today = new Date();
    dateControl.value = today.toISOString().substring(0, 10);
    console.log("Setting date to " + dateControl.value);
}

function formatTimes(events, date) {
    const mainData = document.getElementById("main-data");
    prepareTable();
    for (let i = 0; i < relRooms.length; i++) {
        let times = [];
        const room = relRooms[i];
        const eventInfo = events[date][room];
        let d = document.createElement("div");
        let h = document.createElement("h2");
        h.innerText = room;
        d.appendChild(h);
        let p = document.createElement("p");
        for (const infoAndTimeSpan in eventInfo) {
            if (Object.hasOwnProperty.call(eventInfo, infoAndTimeSpan)) {
                let outerSpan = document.createElement("span");
                let innerSpan = document.createElement("span");
                outerSpan.className = "popup";
                innerSpan.className = "popuptext";

                const ei = eventInfo[infoAndTimeSpan];
                let start = ei["start"].toLocaleTimeString().substring(0, 5);
                let end = ei["end"].toLocaleTimeString().substring(0, 5);

                innerSpan.innerText = ei["courses"];
                outerSpan.innerHTML = start + " - " + end + "<br>";
                outerSpan.appendChild(innerSpan);
                outerSpan.setAttribute("onclick", "popupFunc(this)");
                p.appendChild(outerSpan);

                times = times.concat(start.substr(0, 2) + " " + end.substr(0, 2));
            }
        }
        addRoomTimelineTable(room, times);
        d.appendChild(p);
        mainData.appendChild(d);
    }
}

function getURL() {
    require('fs').readFile('url.txt', 'utf-8', (err, data) => {
        if (err) throw err;
        return data;
    })
}

function fetchCalendar() {
    resetContent();

    const URL = "https://cloud.timeedit.net/liu/web/schema/ri680Q18Y00Z61Q5X1895106y1Z6500XX465109Q6178886X4117XXX212616893807X1X115993192117771811XX98529297X10211622399170X2516164771X88810711XX26X168X965981WX6X5119770X88861481Y1X7XX5758X8X886977618868685884706188X5XX699813198586766887868699180618281XXXX8981119996X6618148XX99891X518X251319988XX8990866W6786X58160161188YX8961090868856XX2X8925Z66834X99111X408y83bmZ7SlWQo5dycL5lR9WalZcQ0l0c5nqXZ6UQmXuQ0p5woyd5Wyn8a72Q5ZW6a3%C3%A4vhWoZnQj90L.ics";
    // URL = getURL();
    console.log("Fetching calendar data...")

    let date = new Date(document.querySelector("input[type=date]").value);
    date.setHours(0, 0, 0);

    let dataPromise = fetchAsyncText(URL);
    dataPromise.then(
        function (value) {
            console.log("Fetched calendar file");
            let events = value.split(/\nEND:VEVENT\r\nBEGIN:VEVENT|BEGIN:VEVENT/img).slice(1);
            events = makeJSON(events);

            console.log(events);

            if (!events[date]) {
                resetContent();
                document.getElementById("dateinfo").innerText = "Inga bokade salar " + date.toLocaleDateString();
            } else {
                formatTimes(events, date)
                document.getElementById("dateinfo").innerText = "Visar bokade salar " + date.toLocaleDateString();
            }
        },
        function (error) {
            console.log(error);
            document.getElementById("dateinfo").innerText = "Something went wrong when fetching the calendar";
        }
    )

}

async function fetchAsyncText(url) {
    let response = await fetch(url);
    let data = await response.text();
    console.log(response.status + " " + response.statusText);
    return data;
}

function makeJSON(events) {
    var JSONevents = {};
    for (const event in events) {
        if (Object.hasOwnProperty.call(events, event)) {
            const element = events[event];
            eventToJSON(element, JSONevents);
        }
    }
    return JSONevents;
}

function ICSDateToJSDate(date) {
    // YYYYMMDDTHHMMSSZ -> MM DD YYYY HH:MM:SS UTC+0000 -> Date()
    let year = date.substr(0, 4);
    let month = parseInt(date.substr(4, 2));
    let day = date.substr(6, 2);
    let hour = date.substr(9, 2);
    let minute = date.substr(11, 2);
    let sec = date.substr(13, 2);
    let utc = "UTC+0000"
    let dateString = month + " " + day + " " + year + " " + hour + ":" + minute + ":" + sec + " " + utc;
    return new Date(dateString);
}

function containsEqDate(JSONobject, date) {
    for (const key in Object.keys(JSONobject)) {
        if (Object.hasOwnProperty.call(Object.keys(JSONobject), key)) {
            if (new Date(Object.keys(JSONobject)[key]).getTime() == date.getTime()) {
                return true;
            }
        }
    }
    return false;
}

function eventToJSON(event, JSONevents) {
    let startPattern = /DTSTART:\d{8}T\d{6}Z/
    let endPattern = /DTEND:\d{8}T\d{6}Z/
    let summaryPattern = /SUMMARY:.+/
    let courseCodePattern = /[A-Z]{4}\d\d/g

    let start = event.match(startPattern)[0].substr(8);
    let end = event.match(endPattern)[0].substr(6);

    start = ICSDateToJSDate(start);
    end = ICSDateToJSDate(end);

    var date = new Date(start);
    date.setHours(0, 0, 0);

    let location = event.replaceAll(/\r|\n|\s/g, "").matchAll(relRoomsRegEx);
    let summary = event.match(summaryPattern)[0].substr(8).replace(/\\/, "");
    let courses = event.matchAll(courseCodePattern);

    let course = courses.next();
    let coursesStr = "";
    while (!course.done) {
        if (coursesStr.length == 0) {
            coursesStr = course.value[0];
        } else {
            coursesStr = coursesStr + ", " + course.value[0];
        }
        course = courses.next();
    }

    if (coursesStr.length < 1) {
        coursesStr = "Ingen kurs listad";
    }

    if (!(date in JSONevents)) {
        JSONevents[date] = Object();
    }

    let room = location.next();
    while (!room.done) {
        if (room.value[0] in JSONevents[date]) {
            JSONevents[date][room.value[0]] = JSONevents[date][room.value[0]].concat([{ "start": start, "end": end, "summary": summary, "courses": coursesStr }]);
        } else {
            JSONevents[date][room.value[0]] = [{ "start": start, "end": end, "summary": summary, "courses": coursesStr }]
        }
        room = location.next();
    }

}
