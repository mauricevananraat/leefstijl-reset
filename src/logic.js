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
