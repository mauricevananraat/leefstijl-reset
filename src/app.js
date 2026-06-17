// src/app.js
import { computeProgress } from "./logic.js";
import { loadState, saveState, getDayLog, resetState } from "./storage.js";
import { getMeals, BASISREGELS } from "./content.js";

const state = loadState();
const todayISO = new Date().toLocaleDateString("sv-SE"); // YYYY-MM-DD lokaal

function show(screen) {
  for (const s of document.querySelectorAll(".screen")) s.classList.add("hidden");
  document.getElementById("screen-" + screen).classList.remove("hidden");
  for (const b of document.querySelectorAll("#tabbar button")) b.classList.toggle("active", b.dataset.screen === screen);
  if (screen === "overzicht") renderOverzicht();
}

function renderVandaag() {
  const dateEl = document.getElementById("day-date");
  const titleEl = document.getElementById("day-title");
  if (!state.startDate) {
    titleEl.textContent = "Welkom";
    dateEl.textContent = "Stel je startdatum in bij 'Meer'.";
    document.getElementById("meal-list").innerHTML = "";
    return;
  }
  const p = computeProgress(state.startDate, todayISO);
  titleEl.textContent = p.beforeStart ? "Plan start binnenkort" : `Dag ${p.dayNumber} · Week ${p.week}`;
  dateEl.textContent = new Date(todayISO).toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });

  const log = getDayLog(state, todayISO);
  const variantBtn = document.getElementById("variant-btn");
  variantBtn.textContent = log.variant === "zwaar" ? "Zware dag" : "Rustige dag";
  variantBtn.onclick = () => { log.variant = log.variant === "zwaar" ? "rustig" : "zwaar"; saveState(state); renderVandaag(); };

  const week = p.beforeStart ? 1 : p.week;
  const meals = getMeals(week, log.variant);
  const list = document.getElementById("meal-list");
  list.innerHTML = "";
  for (const key of ["ontbijt", "lunch", "avond"]) {
    const li = document.createElement("li");
    if (log.meals[key]) li.classList.add("done");
    li.innerHTML = `<span>${log.meals[key] ? "✓" : "○"}</span><div><strong>${key}</strong><br/>${meals[key]}</div>`;
    li.onclick = () => { log.meals[key] = !log.meals[key]; saveState(state); renderVandaag(); };
    list.appendChild(li);
  }

  const rules = document.getElementById("rules-list");
  rules.innerHTML = BASISREGELS.map((r) => `<li>${r}</li>`).join("");

  const droog = document.getElementById("tracker-droog");
  droog.innerHTML = `<strong>Droge dag</strong> `;
  const droogBtn = document.createElement("button");
  droogBtn.className = "seg-btn" + (log.droog ? " active" : "");
  droogBtn.textContent = log.droog ? "Droog ✓" : "Niet droog";
  droogBtn.onclick = () => { log.droog = !log.droog; saveState(state); renderVandaag(); };
  droog.appendChild(droogBtn);

  const sleep = document.getElementById("tracker-sleep");
  sleep.innerHTML = `<strong>Slaap</strong> `;
  const mk = (txt, fn) => { const b = document.createElement("button"); b.className = "seg-btn"; b.textContent = txt; b.onclick = fn; return b; };
  const sleepVal = document.createElement("span"); sleepVal.textContent = ` ${log.sleep ?? "–"} u `;
  sleep.append(mk("–", () => { log.sleep = Math.max(0, (log.sleep ?? 7) - 0.5); saveState(state); renderVandaag(); }), sleepVal, mk("+", () => { log.sleep = (log.sleep ?? 7) + 0.5; saveState(state); renderVandaag(); }));

  const stress = document.getElementById("tracker-stress");
  stress.innerHTML = `<strong>Stress</strong> `;
  for (const lvl of ["laag", "mid", "hoog"]) {
    const b = mk(lvl, () => { log.stress = lvl; saveState(state); renderVandaag(); });
    if (log.stress === lvl) b.classList.add("active");
    stress.appendChild(b);
  }
}

function renderOverzicht() { /* ingevuld in Task 10 */ }

for (const b of document.querySelectorAll("#tabbar button")) b.onclick = () => show(b.dataset.screen);
renderVandaag();
show("vandaag");

const startInput = document.getElementById("start-date");
startInput.value = state.startDate || "";
startInput.onchange = () => { state.startDate = startInput.value || null; saveState(state); renderVandaag(); };

const wStart = document.getElementById("weight-start");
const wEnd = document.getElementById("weight-end");
wStart.value = state.weightStart ?? "";
wEnd.value = state.weightEnd ?? "";
wStart.onchange = () => { state.weightStart = wStart.value ? Number(wStart.value) : null; saveState(state); };
wEnd.onchange = () => { state.weightEnd = wEnd.value ? Number(wEnd.value) : null; saveState(state); };

document.getElementById("reset-btn").onclick = () => {
  if (confirm("Weet je zeker dat je het hele logboek wist?")) { resetState(); location.reload(); }
};
