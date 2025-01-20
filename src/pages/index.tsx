import * as React from "react";
import type { HeadFC, PageProps } from "gatsby";
import { icalToJSON, URL, icalEvent, eventsAtDate, getRoomsBookedAt } from "../scripts/ical";
import { DateTime, today } from "../scripts/date"
import "../index.css";

/* 
  Hus:

  A-huset
  B-huset
  Fysikhuset
  Key-huset


  Lokaltyp:

*/


const IndexPage: React.FC<PageProps> = () => {
  const [responseData, setResponseData] = React.useState("");
  // const [startTime, setStartTime] = React.useState("");
  // const [endTime, setEndTime] = React.useState("");
  // let calendarInfo: icalEvent[] = new Array<icalEvent>();

  // React.useEffect(() => {
  //   fetch(URL).then((response) => {
  //     let charsReceived = 0;
  //     let result: string;
  //     const reader = response.body ? response.body.getReader() : undefined;
  //     reader?.read().then(function processResponseBody({ value, done }) {
  //       if (done) {
  //         console.log("Stream complete");
  //         calendarInfo = eventsAtDate(new DateTime(today()), icalToJSON(result));
  //         setResponseData(calendarInfo.toString());
  //         return calendarInfo;
  //       }
  //       charsReceived += value.length;
  //       result += new TextDecoder().decode(value);

  //       return reader.read().then(processResponseBody);
  //     });
  //   });
  // }, []);

  async function getIcal(): Promise<string> {
    return fetch(URL)
    .then((response) => response.body)
    .then((rb) => {
    if (!rb) {
      return
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
              // console.log("done", done);
              controller.close();
              return;
            }
            // Get the data and send it to the browser via the controller
            controller.enqueue(value);
            // Check chunks by logging to the console
            // console.log(done, value);
            push();
          });
        }

        push();
      },
    });
  })
  .then((stream) =>
    // Respond with our stream
    new Response(stream, { headers: { "Content-Type": "text/html" } }).text(),
  )
  .then((result) => {
    // Do things with result
    return result;
  });
  }

  function getInputDate(): DateTime {
    const dateInput = document.getElementById("date");
    if (!dateInput || !(dateInput instanceof HTMLInputElement)) {
      return new DateTime(today());
    }
    return new DateTime(dateInput.value);
  }

  function handleRoomVisibility() {
    const cbs = document.getElementById("checkboxes");
    if (cbs) {
      const checkboxes = Array.from(cbs.children).filter(elem => elem instanceof HTMLInputElement);
      // console.log("checkboxes", checkboxes);
      checkboxes.forEach(elem => {
        const rooms = document.getElementsByClassName(elem.name);
        if (elem.checked) {
          // console.log("checkbox checked", elem.name);
          Array.from(rooms).forEach(elem => {
            if (elem.classList.contains("hidden")) {
              elem.classList.remove("hidden");
            }
          });
        } else {
          // console.log("checkbox unchecked", elem.name);
          Array.from(rooms).forEach(elem => {
            elem.classList.add("hidden");
          });
          
        }
      })
    }
  }

  function getTimeSlotIndex(startHour: number, endHour: number): number[] {
    let result = new Set<number>();
    switch (startHour) {
      case 8:
      case 9:
        result.add(8);
        break;
        
      case 10:
      case 11:
        result.add(10);
        break;
      
      case 13:
      case 14:
        result.add(13);
        break;
      
      case 15:
      case 16:
        result.add(15);
        break;
      
      case 17:
      case 18:
        result.add(17);
        break;
      
      case 19:
      case 20:
        result.add(19);
        break;
    
      default:
        break;
    }
    switch (endHour) {
      case 11:
        result.add(10);
        break;
      
      case 14:
        result.add(13);
        break;
      
      case 16:
        result.add(15);
        break;
      
      case 18:
        result.add(17);
        break;
      
      case 20:
        result.add(19);
        break;

      default:
        break;
    }
    return Array.from(result).map(val => {
      if (val % 2) {
        return (val - 1)/2 - 3;
      } else {
        return val/2 - 3;
      }
    });
  }

  function pickCourseCode(courses: Array<string>): string {
    const cs = courses.join("/");
    const tekfak = cs.match(new RegExp("T[A-Z]{3}[0-9]{2}"));
    if (tekfak) {
      return tekfak[0];
    }
    return cs.split("/")[0];
  }

  function handleSubmit() {
    handleRoomVisibility();

    const div = document.getElementById("rooms");
    const subdiv = document.getElementById("subdiv");
    if (div && subdiv) {
      getIcal().then(s => {
        let events = eventsAtDate(getInputDate(), icalToJSON(s));
        events.forEach(event => {
          const timeSlots = getTimeSlotIndex(event.start.getHours(), event.end.getHours());
          event.location.forEach(loc => {
            const cells = document.querySelector("." + loc)?.children;
            if (cells) {
              Array.from(cells).forEach((cell, index) => {
                if (timeSlots.includes(index)) {
                  cell.innerHTML = pickCourseCode(event.courses);
                }
              });
            }
        });

        })
        div.appendChild(subdiv);
      });
    }
  }

  return (
    <main>
      <p id="info"> </p>
      <div id="inputbox" className="input">
        <div className="input-item">
          <input id="date" type="date" defaultValue={today()}></input>
        </div>

        {/* <div id="checkboxes">
          <input name="a" type="checkbox"></input>
          <label htmlFor="a">A-huset</label>
          <input name="b" type="checkbox" defaultChecked></input>
          <label htmlFor="b">B-huset</label>
        </div> */}

        <div className="input-item">
          <button id="fetch-button" onClick={handleSubmit}>Hämta</button>
        </div>
      </div>

      <div id="rooms">
        <div id="subdiv"></div>
        <table id="timetable">
          <tr>
            <th>Sal</th>
            <th id="8">08-10</th>
            <th id="10">10-12</th>
            <th id="13">13-15</th>
            <th id="15">15-17</th>
            <th id="17">17-19</th>
            <th id="19">19-21</th>
          </tr>
          <tr className="b SU00">
            <td>SU00</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr className="b SU01">
            <td>SU01</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr className="b SU02">
            <td>SU02</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr className="b SU03">
            <td>SU03</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr className="b SU04">
            <td>SU04</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr className="b SU10">
            <td>SU10</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr className="b SU11">
            <td>SU11</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr className="b SU12">
            <td>SU12</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr className="b SU13">
            <td>SU13</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr className="b SU14">
            <td>SU14</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr className="b SU15">
            <td>SU15/16</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr className="b SU17">
            <td>SU17/18</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr className="b SU24">
            <td>SU24</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr className="b SU25">
            <td>SU25</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          {/* <tr className="a Valhall">
            <td>Valhall</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr> */}
        </table>
      </div>
    </main>
  );
};

export default IndexPage;

export const Head: HeadFC = () => <title>Bokade salar</title>;
