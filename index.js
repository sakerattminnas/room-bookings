MODULE = (function (mod) {
  window.onload = () => {
    document.getElementById("regex-input").value = mod.REGEX;
    addCheckboxes();
    addRooms();
    let dateInput = document.getElementById("date");
    dateInput.defaultValue = mod.today();
  };

  selected = [mod.DEFAULT_CHECKED];
  mod.DATE = new mod.DateTime(mod.today());

  function addCheckboxes() {
    let form = document.getElementById("checkbox-form");
    mod.ROOM_URLS.forEach((_, key) => {
      let label = document.createElement("label");
      let input = document.createElement("input");

      if (key == mod.DEFAULT_CHECKED) {
        input.checked = true;
      }

      label.innerText = key;
      label.htmlFor = key.toLowerCase();
      input.type = "checkbox";
      input.id = key.toLowerCase() + "-cb";
      input.name = key.toLowerCase();
      input.className = "checkbox";

      form.appendChild(input);
      form.appendChild(label);
      form.appendChild(document.createElement("br"));
    })
  };

  function updateSelected() {
    selected = [];
    document.querySelectorAll("#checkbox-form > input").forEach(input => {
      if (input.checked) {
        selected.push(input.name.toUpperCase());
      }
    });
  };

  mod.isSelected = function (roomType) {
    return selected.includes(roomType);
  }

  function clearRooms() {
    let timeTable = document.querySelectorAll(".row");
    timeTable.forEach(row => {
      row.remove();
    })
  }

  mod.clearRegExp = function () {
    mod.REGEX = "";
    document.getElementById("regex-input").value = mod.REGEX;
  }

  function addRooms() {
    clearRooms();

    let timeTable = document.getElementById("timetable")?.children[0];

    mod.ROOMS.forEach((rooms, key) => {

      if (mod.isSelected(key)) {
        rooms.filter((room) => mod.regExpMatch(room)).forEach((room) => {
          let tr = document.createElement("tr");
          let td = document.createElement("td");
          tr.className = "row " + key + " " + room;
          tr.name = room;
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
      };
    });
  }


  mod.handleSubmit = function () {
    const date = document.getElementById("date");
    const info = document.getElementById("info");
    const infodate = document.getElementById("infodate");
    const inforegex = document.getElementById("inforegex")
    mod.REGEX = document.getElementById("regex-input").value;
    mod.setLoading(true);
    console.log("Fetching events");
    updateSelected();
    addRooms();

    if (selected.length > 0) {
      mod.ROOM_URLS.forEach((url, room) => {
        if (mod.isSelected(room) && mod.regExpMatchesAny(room)) {
          mod.getIcal(url);
        }
      });
      infodate.innerText = date.value;
      info.classList = "";
      if (mod.haveRegExp()) {
        inforegex.innerText = " som matchar '" + mod.REGEX + "'";
      } else {
        inforegex.innerText = "";
      }
    }

    mod.setLoading(false);
  }

  return mod;
}(MODULE));

function handleSubmit() {
  MODULE.handleSubmit();
}

function clearRegExp() {
  MODULE.clearRegExp();
}

function toggleFilterVisibility() {
  let filters = document.getElementsByClassName("collapsible-content");
  Array.from(filters).forEach(filter => {
    if (filter.classList.contains("hidden")) {
      filter.classList.remove("hidden");
      document.getElementById("leftarrow").className = "hidden";
      document.getElementById("downarrow").className = "";
    } else {
      filter.classList.add("hidden");
      document.getElementById("leftarrow").className = "";
      document.getElementById("downarrow").className = "hidden";
    }
  });
}
