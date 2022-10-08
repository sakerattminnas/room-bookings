const URL = "https://cloud.timeedit.net/liu/web/schema/ri687Q18Y99Z68Q5X6859196y1Z6589XX460189Q6178886X8818XXX989986815886X6X989818118196631884XX12999916X78066668008198X5917169948X68198341XX05X668X986581WX6X51y9785X888y1481Y1X7lX7Z58X8Z8Q6l776108687m6o8cQu6Z53o5yL0W0W5bQcplSwyW5Z9qdXUXa86jRmW0ld7Qn25W9%C3%A4Laca0ZQhQcZ4v66nn.ics";
const relevantRooms = ['Asgård', 'Boren', 'Egypten', 'Glan', 'Hunn', 'Olympen', 'PC1', 'PC2', 'PC3', 'PC4', 'PC5',
    'Roxen', 'SU00', 'SU01', 'SU02', 'SU03', 'SU04', 'SU10', 'SU11', 'SU12', 'SU13', 'SU14',
    'SU15/16', 'SU17/18', 'SU24', 'SU25'];
const relRoomsRegEx = /Asgård|Boren|Egypten|Glan|Hunn|Olympen|PC1|PC2|PC3|PC4|PC5|Roxen|SU00|SU01|SU02|SU03|SU04|SU10|SU11|SU12|SU13|SU14|SU15\/16|SU17\/18|SU24|SU25/;


function fetchCalendar() {
    console.log("Fetching calendar data...")

    let dataPromise = fetchAsyncText(URL);
    dataPromise.then(
        function (value) {
            let events = value.split(/\nEND:VEVENT\r\nBEGIN:VEVENT|BEGIN:VEVENT/im).slice(1);
            document.getElementById("data").innerText = makeJSON(events);
        },
        function (error) { console.log("Something went wrong: " + error) }
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
    return JSON.stringify(JSONevents);
}

function eventToJSON(event, JSONevents) {
    let startPattern = /DTSTART:\d{8}T\d{6}Z/
    let endPattern = /DTEND:\d{8}T\d{6}Z/
    let locationPattern = /LOCATION:.+/
    // let summaryPattern = /SUMMARY:.+/

    let start = event.match(startPattern)[0].substr(8, 16);
    let date = start.substr(0, 8);
    start = start.substr(9)
    let end = event.match(endPattern)[0].substr(15);
    let location = event.match(locationPattern)[0].split(/LOCATION:Lokal: |\\, |Lokal: /).slice(1);
    // let summary = event.match(summaryPattern)[0].substr(8).replace(/\\/, "");

    for (const loc in location) {
        if (Object.hasOwnProperty.call(location, loc)) {
            const element = location[loc];
            if(!element.match(relRoomsRegEx)) {
                location.splice(location.indexOf(element), 1);
            }
        }
    }


    if (Object.keys(JSONevents).includes(date) && location.length != 0) {
        JSONevents[date] = JSONevents[date].concat([{ "start": start, "end": end, "location": location }]);
    } else if (location.length != 0) {
        JSONevents[date] = [{ "start": start, "end": end, "location": location }];
    }

}

"\r\nDTSTART:20221003T061500Z\r\nDTEND:20221003T080000Z\r\nUID:2634910--"
"425816690-0@timeedit.com\r\nDTSTAMP:20221008T091754Z\r\nLAST-MODIFIED:2"
"0221008T091754Z\r\nSUMMARY:TAOP33\\, LA\r\nLOCATION:Lokal: Olympen\r\nD"
"ESCRIPTION:Lab 4\\nLaboration\\nID 2634910\r"