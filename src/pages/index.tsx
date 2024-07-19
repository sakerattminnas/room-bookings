import * as React from "react";
import type { HeadFC, PageProps } from "gatsby";
import { icalToJSON, URL, icalEvent, eventsAtDate, getRoomsBookedAt } from "../scripts/ical";
import { DateTime, today } from "../scripts/date"
import "../index.css";

/* 
  Hus:

  A-huset
  B-huset
  C-huset
  Fysikhuset
  Key-huset


  Lokaltyp:

*/


const IndexPage: React.FC<PageProps> = () => {
  const [responseData, setResponseData] = React.useState("");
  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");
  let calendarInfo: icalEvent[] = new Array<icalEvent>();

  React.useEffect(() => {
    fetch(URL).then((response) => {
      let charsReceived = 0;
      let result: string;
      const reader = response.body ? response.body.getReader() : undefined;
      reader?.read().then(function processResponseBody({ done, value }) {
        if (done) {
          console.log("Stream complete");
          // setResponseData(result);
          calendarInfo = icalToJSON(result);
          return calendarInfo;
        }
        charsReceived += value.length;
        result += new TextDecoder().decode(value);

        return reader.read().then(processResponseBody);
      });
    });
  }, []);

  function handleSubmit() {
    const date = document.getElementById("date");
    const infoParagraph = document.getElementById("info");
    const startTimeHour = document.getElementById("start-time-hour");
    const startTimeMinute = document.getElementById("start-time-minute");
    const endTimeHour = document.getElementById("end-time-hour");
    const endTimeMinute = document.getElementById("end-time-minute");
    if (
      infoParagraph instanceof HTMLParagraphElement &&
      date instanceof HTMLInputElement &&
      startTimeHour instanceof HTMLSelectElement &&
      startTimeMinute instanceof HTMLSelectElement &&
      endTimeHour instanceof HTMLSelectElement &&
      endTimeMinute instanceof HTMLSelectElement
    ) {
      if (date.value === "") {
        infoParagraph.innerText = "Datum saknas!";
      } else {
        const day = today() === date.value ? "idag" : `den ${date.value}`;
        infoParagraph.innerText =
          `Visar lediga lokaler ${day} från ` +
          `${startTimeHour.value}:${startTimeMinute.value} - ` +
          `${endTimeHour.value}:${endTimeMinute.value}`;
      }
      const roomDiv = document.getElementById("rooms");
      if (roomDiv instanceof HTMLDivElement && calendarInfo.length > 0) {
        console.log(date.value);
        const events = eventsAtDate(new DateTime(date.value), calendarInfo);
        let rooms = getRoomsBookedAt(events);
        console.log(rooms);
      } else {
        infoParagraph.innerText = "Något gick fel, försök igen.";
      }
    }
  }

  return (
    <main>
      <p id="info"> </p>
      <div className="input">
        <div className="input-item">
          <input id="date" type="date" defaultValue={today()}></input>
        </div>
        <div className="input-item">
          <select id="start-time-hour" defaultValue={"8"}>
            <option value="0">00</option>
            <option value="1">01</option>
            <option value="2">02</option>
            <option value="3">03</option>
            <option value="4">04</option>
            <option value="5">05</option>
            <option value="6">06</option>
            <option value="7">07</option>
            <option value="8">08</option>
            <option value="9">09</option>
            <option value="10">10</option>
            <option value="11">11</option>
            <option value="12">12</option>
            <option value="13">13</option>
            <option value="14">14</option>
            <option value="15">15</option>
            <option value="16">16</option>
            <option value="17">17</option>
            <option value="18">18</option>
            <option value="19">19</option>
            <option value="20">20</option>
            <option value="21">21</option>
            <option value="22">22</option>
            <option value="23">23</option>
          </select>
          <span className="between-time">:</span>
          <select id="start-time-minute" defaultValue={"15"}>
            <option value="0">00</option>
            <option value="15">15</option>
            <option value="30">30</option>
            <option value="45">45</option>
          </select>
          <span className="between-times">-</span>
          <select id="end-time-hour" defaultValue={"10"}>
            <option value="0">00</option>
            <option value="1">01</option>
            <option value="2">02</option>
            <option value="3">03</option>
            <option value="4">04</option>
            <option value="5">05</option>
            <option value="6">06</option>
            <option value="7">07</option>
            <option value="8">08</option>
            <option value="9">09</option>
            <option value="10">10</option>
            <option value="11">11</option>
            <option value="12">12</option>
            <option value="13">13</option>
            <option value="14">14</option>
            <option value="15">15</option>
            <option value="16">16</option>
            <option value="17">17</option>
            <option value="18">18</option>
            <option value="19">19</option>
            <option value="20">20</option>
            <option value="21">21</option>
            <option value="22">22</option>
            <option value="23">23</option>
          </select>
          <span className="between-time">:</span>
          <select id="end-time-minute" defaultValue={"15"}>
            <option value="0">00</option>
            <option value="15">15</option>
            <option value="30">30</option>
            <option value="45">45</option>
          </select>
        </div>

        <div className="input-item">
          <button id="fetch-button" onClick={handleSubmit}>
            Hämta lediga<br></br>lokaler
          </button>
        </div>
      </div>
      <div id="rooms"></div>
    </main>
  );
};

export default IndexPage;

export const Head: HeadFC = () => <title>Home Page</title>;
