const relRooms = ["Asgård", "Boren", "Egypten", "Glan", "Hunn", "Olympen", "PC1", "PC2", "PC3", "PC4", "PC5", "Roxen", "SU00", "SU01", "SU02", "SU03", "SU04", "SU10", "SU11", "SU12", "SU13", "SU14", "SU15\/16", "SU17\/18", "SU24", "SU25"];
const relRoomsRegEx = /Asgård|Boren|Egypten|Glan|Hunn|Olympen|PC1|PC2|PC3|PC4|PC5|Roxen|SU00|SU01|SU02|SU03|SU04|SU10|SU11|SU12|SU13|SU14|SU15\/16|SU17\/18|SU24|SU25/g;
const minTime = 8;
const maxTime = 22;

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

function resetAll() {
    document.getElementById("dateinfo").innerHTML = "";
    document.getElementById("data").innerHTML = "";
    document.getElementById("main-data").innerHTML = "";
    document.getElementById("room-div").innerHTML = "";
    document.querySelector('input[type="date"]').value = "";
    document.getElementById("timeline").innerHTML = "";
    // addRoomCheckboxes();
}

function addRoomTimeline(room, timesStr) {
    let currTime = minTime;
    const timeline = document.getElementById("timeline");
    let container = document.createElement("div");
    let label = document.createElement("div");
    container.className = "timeline-container";
    label.className = "timeline-label";
    // label.className = "timeline-item timeline-label";
    label.innerHTML = room;
    container.appendChild(label);
    timesStr.forEach(t => {

        let startInt = parseInt(t.substr(0, 2));
        let endInt = parseInt(t.substr(3, 2));

        let hours = endInt - startInt;

        for (let time = currTime; time < maxTime; time++) {
            if (time < startInt) {
                let emptyDiv = document.createElement("div");
                emptyDiv.className = "timeline-item hide one-hour";
                container.appendChild(emptyDiv);
            } else if (time == endInt) {
                let d = document.createElement("div");
                let startdiv = document.createElement("div");
                let enddiv = document.createElement("div");
                startdiv.className = "starttime";
                startdiv.innerHTML = startInt;
                enddiv.className = "endtime";
                enddiv.innerHTML = endInt;
                switch (hours) {
                    case 2:
                        d.className = "timeline-item two-hours"
                        break;
                    case 3:
                        d.className = "timeline-item three-hours"
                        break;
                    case 4:
                        d.className = "timeline-item four-hours"
                        break;

                    default:
                        d.className = "timeline-item one-hour"
                        break;
                }
                d.appendChild(startdiv);
                d.appendChild(enddiv);
                container.appendChild(d);
            }
        }
        currTime = endInt;
    });

    while (currTime < maxTime) {
        currTime += 1;
        let emptyDiv = document.createElement("div");
            emptyDiv.className = "timeline-item hide one-hour";
            container.appendChild(emptyDiv);
    }

    timeline.appendChild(container);
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
    mainData.innerHTML = "";
    document.getElementById("timeline").innerHTML = "";
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
        addRoomTimeline(room, times);
        d.appendChild(p);
        mainData.appendChild(d);
    }
}

function fetchCalendar() {

    console.log("Fetching calendar data...")
    const URL = "https://cloud.timeedit.net/liu/web/schema/ri687Q18Y99Z68Q5X6859196y1Z6589XX460189Q6178886X8818XXX989986815886X6X989818118196631884XX12999916X78066668008198X5917169948X68198341XX05X668X986581WX6X51y9785X888y1481Y1X7lX7Z58X8Z8Q6l776108687m6o8cQu6Z53o5yL0W0W5bQcplSwyW5Z9qdXUXa86jRmW0ld7Qn25W9%C3%A4Laca0ZQhQcZ4v66nn.ics";

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
                document.getElementById("dateinfo").innerText = "Inga bokade salar " + date.toLocaleDateString();
                document.getElementById("data").innerText = "";
                document.getElementById("main-data").innerHTML = "";
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
