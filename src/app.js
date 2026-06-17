// src/app.js
import { computeProgress } from "./logic.js";
import { loadState, saveState, getDayLog } from "./storage.js";
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
}

function renderOverzicht() { /* ingevuld in Task 10 */ }

for (const b of document.querySelectorAll("#tabbar button")) b.onclick = () => show(b.dataset.screen);
renderVandaag();
show("vandaag");
