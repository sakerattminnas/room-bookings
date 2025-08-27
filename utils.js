MODULE = (function (mod) {

    mod.getTimeSlotIndex = function (startHour, endHour) {
        const timeSlotIndeces = [8, 10, 13, 15, 17, 19, 21];
        let result = new Set();
        for (let i = 1; i < timeSlotIndeces.length; i++) {
            const timeSlotStart = timeSlotIndeces[i - 1];
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

    mod.pickCourseCode = function (courses) {
        const cs = courses.join("/");
        const tekfak = cs.match(new RegExp("T[A-Z]{3}[0-9]{2}"));
        if (tekfak) {
            return tekfak[0];
        }
        return cs.split("/")[0];
    }

    mod.setLoading = function (on) {
        let loader = document.getElementById("loader");
        if (on) {
            loader.classList = "";
        } else {
            loader.classList = "hidden";
        }
    }

    mod.REGEX = "";

    mod.haveRegExp = function () {
        return mod.REGEX.length > 0;
    }

    mod.regExpMatch = function (room) {
        const regexp = new RegExp(mod.REGEX, "i");
        return !mod.haveRegExp() || mod.haveRegExp() && room.match(regexp);
    }

    mod.regExpMatchesAny = function (roomType) {
        let found = mod.ROOMS.get(roomType).find(room => mod.regExpMatch(room));
        return found != undefined;
    };

    return mod;
}(MODULE));