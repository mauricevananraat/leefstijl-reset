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

export function summarize(daysObj) {
  const logs = Object.values(daysObj || {});
  let dryDays = 0, completedMeals = 0, totalMeals = 0;
  const sleeps = [];
  const stress = { laag: 0, mid: 0, hoog: 0 };
  for (const log of logs) {
    if (log.droog) dryDays++;
    const meals = log.meals || {};
    for (const key of ["ontbijt", "lunch", "avond"]) {
      totalMeals++;
      if (meals[key]) completedMeals++;
    }
    if (typeof log.sleep === "number") sleeps.push(log.sleep);
    if (log.stress && stress[log.stress] !== undefined) stress[log.stress]++;
  }
  const avgSleep = sleeps.length
    ? Math.round((sleeps.reduce((a, b) => a + b, 0) / sleeps.length) * 10) / 10
    : null;
  return { dryDays, avgSleep, completedMeals, totalMeals, stress };
}

export function weightDelta(start, end) {
  if (typeof start !== "number" || typeof end !== "number") return null;
  return Math.round((end - start) * 10) / 10;
}
