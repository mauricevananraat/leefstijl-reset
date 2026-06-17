// src/logic.js
export function ping() {
  return "pong";
}

function toUTC(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

export function daysBetween(startISO, todayISO) {
  const ms = toUTC(todayISO) - toUTC(startISO);
  return Math.round(ms / 86400000);
}

export function computeProgress(startISO, todayISO) {
  const diff = daysBetween(startISO, todayISO);
  const dayNumber = diff + 1;
  return {
    dayNumber,
    week: dayNumber <= 7 ? 1 : 2,
    beforeStart: diff < 0,
    afterPlan: dayNumber > 14,
  };
}

export function isWeekday(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0=zo..6=za
  return dow >= 1 && dow <= 5;
}

export function defaultDroog(iso) {
  return isWeekday(iso);
}

export function emptyDayLog(iso) {
  return {
    variant: "rustig",
    meals: { ontbijt: false, lunch: false, avond: false },
    droog: defaultDroog(iso),
    sleep: null,
    stress: null,
  };
}
