MODULE = (function (mod) {

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
                matchedCourses = new Array(["ÖVRIGT"]);
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
            let selected_rooms = [];

            mod.ROOMS.forEach((rooms, key) => {
                if (mod.isSelected(key)) {
                    rooms.forEach((room) => {
                        selected_rooms.push(room);
                    });
                }
            });

            while (!nextMatch.done) {
                let room = nextMatch.value[1].split("/")[0];
                if (selected_rooms.find((r) => r === room)) {
                    rooms.add(room);
                }
                nextMatch = locStringMatch.next();
            }
        }

        return {
            start: mod.parseDate(start[1]),
            end: mod.parseDate(end[1]),
            summary: summ,
            location: Array.from(rooms),
            description: desc,
            courses: Array.from(courses),
        };
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

    mod.icalToJSON = function (ical) {
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


    function getInputDate() {
        const dateInput = document.getElementById("date");
        if (!dateInput || !(dateInput instanceof HTMLInputElement)) {
            return new mod.DateTime(mod.today());
        }
        return new mod.DateTime(dateInput.value);
    }

    mod.getIcal = async function (URL) {
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
                const date = getInputDate();
                let events = eventsAtDate(getInputDate(), mod.icalToJSON(result));
                if (!events) {
                    return;
                }
                let rows = document.getElementsByClassName("row");

                if (date.toDateString() != mod.DATE.toDateString()) {
                    mod.DATE = date;
                    Array.from(rows).forEach((row) => {
                        for (let i = 1; i < row.children.length; i++) {
                            const elem = row.children[i];
                            elem.innerText = "";
                        }
                    });
                };

                events.forEach((event) => {

                    var endHour = event.end.getHours();
                    var startHour = event.start.getHours();
                    if (event.start.beforeDate(date)) {
                        startHour = 0;
                    }
                    if (event.end.afterDate(date)) {
                        endHour = 23;
                    }

                    const timeSlots = mod.getTimeSlotIndex(startHour, endHour);

                    event.location.filter((loc) => mod.regExpMatch(loc)).forEach((loc) => {
                        const cells = document.querySelector("." + loc)?.children;
                        if (cells) {
                            Array.from(cells).forEach((cell, index) => {
                                if (timeSlots.includes(index)) {
                                    cell.innerText = mod.pickCourseCode(event.courses);
                                }
                            });
                        }
                    });
                });
            })
            .catch((e) => console.log(e));
    }



    return mod;
}(MODULE));