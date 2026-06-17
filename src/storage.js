// src/storage.js
import { emptyDayLog } from "./logic.js";

const KEY = "leefstijl-reset:v1";

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Kon opslag niet lezen:", e);
  }
  return { startDate: null, weightStart: null, weightEnd: null, days: {} };
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Kon opslag niet schrijven:", e);
  }
}

export function resetState() {
  try {
    localStorage.removeItem(KEY);
  } catch (e) {
    console.error("Kon opslag niet wissen:", e);
  }
}

export function getDayLog(state, iso) {
  if (!state.days[iso]) state.days[iso] = emptyDayLog(iso);
  return state.days[iso];
}
