import { DateTime, Duration } from "./date";

export interface icalEvent {
  start: DateTime;
  end: DateTime;
  summary: string;
  location: Array<Room>;
  description: string;
  courses: string[];
}

export interface roomEvent {
  room: string;
  duration: Duration;
  course: string;
}

const rooms = ["SU00", "SU01", "SU02", "SU03", "SU04", "SU10", "SU11", "SU12", "SU13", "SU14", "SU15", "SU17", "SU24", "SU25", "Valhall"] as const;
type Room = (typeof rooms)[number];

const isRoom = (x: any): x is Room => rooms.includes(x);

export function eventsAtDate(date: DateTime, icalEvents: icalEvent[]): icalEvent[] {
  const events = new Array<icalEvent>();
  icalEvents.forEach((ev) => {
    if (date.sameDateAs(ev.start) || date.sameDateAs(ev.end)) {
      events.push(ev);
    }
  });
  return events;
}

export function getRoomsBookedAt(events: icalEvent[]): Map<string, Set<Duration>> {
  let result = new Map<string, Set<Duration>>();
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

// export function getRoomsNotBookedAt(events: icalEvent[]): Map<string, Set<Duration>> {
//   const roomsBookedAt = getRoomsBookedAt(events)
//   let result = new Map<string, Set<Duration>>();
//   roomsBookedAt.forEach((room) => {

//   });
//   return result;
// }

// function eventsAtTime(date: DateTime, icalEvents: icalEvent[]): icalEvent[] {
//     const events = new Array<icalEvent>;
//     icalEvents.forEach(ev => {
//         if (date.sameDateTimeAs(ev.start) || date.sameTimeAs(ev.end)) {
//             events.push(ev);
//         }
//     });
//     return events;
// }

// function eventsInDuration(duration: Duration, icalEvents: icalEvent[]): unbookedRoom[] {
//     const start = duration.start;
//     const end = duration.end;
//     let events = eventsAtDate(start, icalEvents);
//     if (!start.sameDateAs(end)) {
//         events = events.concat(eventsAtDate(end, icalEvents));
//     }
//     const inDuration = new Array<unbookedRoom>;
//     events.forEach(ev => {
//         let eventDuration = new Duration(ev.start, ev.end);
//         if (duration.existsOverlapWith(eventDuration)) {
//             // inDuration.push(duration.getOverlap(eventDuration));
//         }
//     });

//     return inDuration;
// }

function extractEvents(ical: string): RegExpMatchArray | null {
  const eventRegex = new RegExp("BEGIN:VEVENT.+?END:VEVENT", "gsu");
  return ical.match(eventRegex);
}

function parseDate(dateString: string): DateTime {
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

function stringToEvent(icalEventString: string): icalEvent | null {
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
  let courses = new Set<string>();
  if (summary !== null) {
    summ = summary[1];
    summ = summ.replaceAll("\\n", "\n");
    summ = summ.replaceAll("\\", "");

    summ.matchAll(
      new RegExp("(T[A-Z]{3}[0-9]{2}|[0-9]{2}[A-Z0-9]{4})", "g")
    ).toArray().forEach(val => val.forEach(entry => {
        courses.add(entry)
      }
    ));
  }

  let rooms = new Set<Room>();
  if (locationMatch !== null) {
    let locString = locationMatch[1] + ";";
    locString = locString.replaceAll("\\n", ";");
    locString = locString.replace(new RegExp("[\n \r]+", "g"), "");

    let locStringMatch = locString.matchAll(new RegExp("Lokal:(.+?);", "gu"));

    let value = locStringMatch.next();
    while (!value.done) {
      let room = value.value[1];
      if (isRoom(room)) {
        rooms.add(room);
      }
      value = locStringMatch.next();
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

export function icalToJSON(ical: string): Array<icalEvent> {
  ical = ical.replaceAll("\r", "");
  let eventsStrings = extractEvents(ical);
  if (eventsStrings === null) {
    console.log("No events found.");
    return new Array<icalEvent>();
  }

  let events = new Array<icalEvent>();

  eventsStrings.forEach((eventString) => {
    let ev = stringToEvent(eventString);
    if (ev !== null) {
      events.push(ev);
    }
  });

  console.log("Finished fetching events.");
  return events;
}

export const URL = 
  // "https://cloud.timeedit.net/liu/web/schema/ri6mQXYl64ZZ0bQvyl0ZZZq5ylYc" +
  // "15uQ087QQ99QyY7ol5Z8oQ5m50ZWajdyWRpnW95W6X9aZ5LQ0%C3%A4mSaLvn9c8ywX35U" +
  // "WodhcQn0265.ics";
  "https://cloud.timeedit.net/liu/web/schema/ri679Q93Y09Z55Q5X0870609y6Z8509" +
  "XX480949Q5777978X6864XXX674426894995X6X273577113136669779XX92054515X36156" +
  "634439147X1456180457X47787011XX45X665X674371WX6X5159457X74491405Y5X3XX435" +
  "0X4X006043916067068075939000X1XX909357800009399543393900549250035XXXX3005" +
  "050406X9614910XX40245X517X071951170XX7452759W6849X00512595501YX0193191090" +
  "059XX0X0400X99014X09555X2206056105000X49215X9X805004599090XX2955273927000" +
  "9X2252XXX080406215006X9X78923X514106W47780XX1406505607Y188625073598X59265" +
  "61097X01865811X957X689X4404816X7X2213184X5X36418171X5XX8520X3X88801562508" +
  "279305166688XX3XX806659155059506196866W07142758871XX7X40Y9945707X6611108X" +
  "X00901X118X451111188XX8003866667108X81524611868X0670292868906XX8X8570X660" +
  "11X71111X4206081181X70X06911X4X30550266W992X606712596288Y89X9412XXX480207" +
  "017898X6X680568117136611130XX06655616X08166706101185X6698183919X78598494X" +
  "859X665X0104926X9X1168688X8X56429512X1XX8496X65XY656561526699558167W878X5" +
  "XX696812358586761187867655181618889XXXX8581915536X2148189XX63467X118X7611" +
  "71105XX0276862665958X99244974367X5598432X63309X03XY390X9W028X09544X760998" +
  "1534330X09644X5X004506599090XX16442499633538X5712XXX695958048886X6X982018" +
  "112596699182XX12656717X71777616414910X22559W3512X51Y31911X527X67XX1996849" +
  "X198512934X7X21990581X2XX6959X5X101939111296197205828148X3XX6883126589860" +
  "69552461655143418133XXXX4581615596X1254177XX75418X718X793874644X3X6568641" +
  "W3297XY6707717957X6118400868796XX7X8979X16777X97114X6118569059316X92099X1" +
  "X578691189983XX26549587159816X7815XXX6X6516859888X664889481141866572Y8XX8" +
  "065661WX17996696892138X8676194686X68878311X868X667X4498816X6X1111902X8X66" +
  "998181X1XX6166X6X886699611669453681616881X8XX1661267516Y68361916W16885089" +
  "9X841XXX66600422686X6611021XX16061X110X341121680XX8623836662168X824216118" +
  "48X6665165468866XX8X8796X69602X51211X32660135848X5X62311X0X9616621666W6XX" +
  "165148262888Y666313XXX697757343887X6X680370115476651999XX48676747X4856668" +
  "6881140X7741162360X78158881X876X660X7686846X7X1588498XXX51880884X8XX68737" +
  "6X1187166916W79193Y1681811X9XX646881271781811178818144881311888XXXX841828" +
  "4076X6612138XX17171X118X221411286XX8774367666168X85125619083X79W3215868X2" +
  "6XXY78235X26644X68114X9271740084206X56091X4X878772161668XX56486191342806X" +
  "7314XXX682656518886X6X530573180108848889XX18662686X93180287342218X2816563" +
  "783X1X89Y414X857X6W820353616X7X1112544X7X12407171X8XX2512X1X7727052111205" +
  "60171642871X8XX756756578796269144594869802743855XXXX2981018555X9614527X60" +
  "5485X50XX071954435XX8365YW9960057X74561611848X6665636868866XX8X8676X66665" +
  "X61111X0668690851858X56152X7X671777167667XX4W210487058887X9151XXX58880611" +
  "3XY6X0X086489810106791881X819687846X08266646562148X8616263863X85818511X86" +
  "6X668X0656816X8X1310523X9X86578181X5XX6568X1X886675611877138885W16X88X5XX" +
  "685618988586766484666688160618Y618XXX6881918968X6841128XX08671X198X129116" +
  "754XX9982566675188X86771611858X666770786X88WXX8X8868866877X81151X61678831" +
  "88689X58321X7X066284668862XX781114967Y8648X2367XXX288487313666X8X88833861" +
  "5386611681XX14288816X48266W98997108X8816168885X68868915XY88X668X9919X1985" +
  "X1112953X8X86498181X1XX6188X8X886891611869064881616888X9XX666717898886966" +
  "111167688118518841XXXX1681218876XW61246XXX28081X0117381552489XX8897876569" +
  "25YX84231611818X8663292868886XX8X8408X66822X81111X2386857181888X86411X9X8" +
  "81883166868XX46114766388886X2414XX7887906419886X6X5X443Y15014W004882XX148" +
  "95936X99471149747747X7371718916X96776977X539X117X5777779X9X9191190X8X9999" +
  "5959X1XX9299X9X55996199996219295992955YX46X99912129X95W869992192765970395" +
  "519XXXX4981356619X9981137XX61699X988X568499918XX1994169997617X79979989117" +
  "X5990898197719XX7X2611X99299X19898X2919230979Y71X19499X7X6971199911951X19" +
  "95154W17X779X8199XXX215289189719X9X729891888879291121XX88156299X088691267" +
  "45540X6946566951X11867817X856X680X7595646X9X1110895X8X9678X78594XX6895X9X" +
  "Y86981W11669886981688888X4XX696811298986566178968699193018891XXXX99819159" +
  "56X9919187XX96694X118X895155470XX8592866669498X01111W11X68X9668451Y68896X" +
  "X8X8999X61611991815X7196517821889X66248X7X691906116969XX26112506008886X92" +
  "12XXX985926213886X6X373218152149631884XX12999916X8806665644810XX671647992" +
  "3X19808711X8951W7YX8471856X1X1510005X7X36708171X8XX9861X6X887107615193458" +
  "111686828X8XX646816718186168128860611188918886XXXX818131156676W83498XX410" +
  "51X519X4454180X7XXY779276955467X80871631858X3665802119816XX8X8456X62681X6" +
  "1921X6476635F8dF69Z6t12193X6QE414D6B8n5CF00QZ012815t1Q3Z7FDD04ABE565FAF5B" +
  "08.ics";
