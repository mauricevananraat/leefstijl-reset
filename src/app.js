// src/app.js
import { computeProgress, summarize, weightDelta } from "./logic.js";
import { loadState, saveState, getDayLog, resetState } from "./storage.js";
import { getMeals, BASISREGELS } from "./content.js";

const state = loadState();
const todayISO = new Date().toLocaleDateString("sv-SE"); // YYYY-MM-DD lokaal

const $ = (id) => document.getElementById(id);
const MEAL_LABEL = { ontbijt: "Ontbijt", lunch: "Lunch", avond: "Avondeten" };
const STRESS_LABEL = { laag: "Laag", mid: "Gem.", hoog: "Hoog" };
const CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 6"/></svg>';

function fmtNum(v) {
  return v == null ? "–" : String(v).replace(".", ",");
}
function setDayControls(visible) {
  for (const id of ["field-variant", "field-meals", "field-trackers", "field-rules"]) {
    $(id).classList.toggle("hidden", !visible);
  }
}

function show(screen) {
  for (const s of document.querySelectorAll(".screen")) s.classList.add("hidden");
  $("screen-" + screen).classList.remove("hidden");
  for (const b of document.querySelectorAll("#tabbar button")) b.classList.toggle("active", b.dataset.screen === screen);
  if (screen === "overzicht") renderOverzicht();
}

function renderVandaag() {
  const hero = $("day-hero");
  const weekEl = $("day-week");
  const titleEl = $("day-title");
  const dateEl = $("day-date");
  const progWrap = $("day-progress-wrap");
  const progFill = $("day-progress");
  const progLabel = $("day-progress-label");

  // Lege/afgeronde toestanden: gedempte hero, geen dag-bediening.
  if (!state.startDate || computeProgress(state.startDate, todayISO).afterPlan) {
    const done = !!state.startDate;
    hero.classList.add("hero--plain");
    weekEl.style.display = "none";
    progWrap.style.display = "none";
    progLabel.style.display = "none";
    titleEl.textContent = done ? "Plan afgerond" : "Welkom";
    dateEl.textContent = done ? "Je 14 dagen zitten erop — bekijk je overzicht." : "Stel je startdatum in bij 'Meer'.";
    setDayControls(false);
    return;
  }

  const p = computeProgress(state.startDate, todayISO);
  const planWeek = p.beforeStart ? 1 : p.week;

  hero.classList.remove("hero--plain");
  weekEl.style.display = "";
  weekEl.textContent = `Week ${planWeek}`;
  titleEl.textContent = p.beforeStart ? "Plan start binnenkort" : `Dag ${p.dayNumber}`;
  dateEl.textContent = new Date(todayISO).toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });
  if (p.beforeStart) {
    progWrap.style.display = "none";
    progLabel.style.display = "none";
  } else {
    progWrap.style.display = "";
    progLabel.style.display = "";
    progFill.style.width = Math.round((p.dayNumber / 14) * 100) + "%";
    progLabel.textContent = `Dag ${p.dayNumber} van 14`;
  }
  setDayControls(true);

  const log = getDayLog(state, todayISO);

  // Type dag — segmented control
  const vc = $("variant-control");
  vc.innerHTML = "";
  for (const v of ["rustig", "zwaar"]) {
    const b = document.createElement("button");
    b.className = "seg" + (log.variant === v ? " active" : "");
    b.textContent = v === "zwaar" ? "Zwaar" : "Rustig";
    b.onclick = () => { log.variant = v; saveState(state); renderVandaag(); };
    vc.appendChild(b);
  }

  // Maaltijden — kaarten met vink-cirkel
  const meals = getMeals(planWeek, log.variant);
  const list = $("meal-list");
  list.innerHTML = "";
  for (const key of ["ontbijt", "lunch", "avond"]) {
    const li = document.createElement("li");
    li.className = "meal" + (log.meals[key] ? " done" : "");
    li.innerHTML = `<span class="meal-check">${CHECK_SVG}</span><span class="meal-text"><span class="meal-name">${MEAL_LABEL[key]}</span><span class="meal-desc">${meals[key]}</span></span>`;
    li.onclick = () => { log.meals[key] = !log.meals[key]; saveState(state); renderVandaag(); };
    list.appendChild(li);
  }

  // Basisregels
  $("rules-list").innerHTML = BASISREGELS.map((r) => `<li>${r}</li>`).join("");

  // Droge dag — switch
  const droog = $("tracker-droog");
  droog.innerHTML = `<div class="tracker-row"><span class="tracker-label">Droge dag</span><button class="switch${log.droog ? " on" : ""}" role="switch" aria-checked="${log.droog}" aria-label="Droge dag"><span class="switch-knob"></span></button></div>`;
  droog.querySelector(".switch").onclick = () => { log.droog = !log.droog; saveState(state); renderVandaag(); };

  // Slaap — stepper
  const sleep = $("tracker-sleep");
  sleep.innerHTML = `<div class="tracker-row"><span class="tracker-label">Slaap</span><div class="stepper"><button class="step-btn" data-act="minus" aria-label="Minder slaap">−</button><span class="step-val">${fmtNum(log.sleep)} u</span><button class="step-btn" data-act="plus" aria-label="Meer slaap">+</button></div></div>`;
  sleep.querySelector('[data-act="minus"]').onclick = () => { log.sleep = Math.max(0, (log.sleep ?? 7) - 0.5); saveState(state); renderVandaag(); };
  sleep.querySelector('[data-act="plus"]').onclick = () => { log.sleep = (log.sleep ?? 7) + 0.5; saveState(state); renderVandaag(); };

  // Stress — kleurgecodeerde segmenten
  const stress = $("tracker-stress");
  let segs = "";
  for (const lvl of ["laag", "mid", "hoog"]) {
    segs += `<button class="seg ${lvl}${log.stress === lvl ? " active" : ""}" data-lvl="${lvl}">${STRESS_LABEL[lvl]}</button>`;
  }
  stress.innerHTML = `<div class="tracker-col"><span class="tracker-label">Stress</span><div class="segmented segmented--stress">${segs}</div></div>`;
  for (const b of stress.querySelectorAll(".seg")) {
    b.onclick = () => { log.stress = b.dataset.lvl; saveState(state); renderVandaag(); };
  }
}

function renderOverzicht() {
  const s = summarize(state.days);
  const wd = weightDelta(state.weightStart, state.weightEnd);
  const pct = s.totalMeals ? Math.round((s.completedMeals / s.totalMeals) * 100) : 0;

  let wClass = "";
  let wNum = "–";
  if (wd !== null) {
    wNum = (wd > 0 ? "+" : "") + fmtNum(wd);
    wClass = wd < 0 ? " good" : wd > 0 ? " bad" : "";
  }

  $("summary-tiles").innerHTML = `
    <div class="tile wide">
      <div class="row"><div class="label">Maaltijden voltooid</div><div class="pct">${pct}%</div></div>
      <div class="num">${s.completedMeals}<span style="font-size:18px;font-weight:600;color:var(--muted)"> / ${s.totalMeals}</span></div>
      <div class="bar"><span style="width:${pct}%"></span></div>
    </div>
    <div class="tile"><div class="num">${s.dryDays}</div><div class="label">droge dagen</div></div>
    <div class="tile"><div class="num">${fmtNum(s.avgSleep)}</div><div class="label">gem. slaap (u)</div></div>
    <div class="tile${wClass}"><div class="num">${wNum}</div><div class="label">gewicht (kg)</div></div>
    <div class="tile"><div class="num">${s.stress.laag}·${s.stress.mid}·${s.stress.hoog}</div><div class="label">stress L·M·H</div></div>
  `;
}

for (const b of document.querySelectorAll("#tabbar button")) b.onclick = () => show(b.dataset.screen);
renderVandaag();
show("vandaag");

const startInput = $("start-date");
startInput.value = state.startDate || "";
startInput.onchange = () => { state.startDate = startInput.value || null; saveState(state); renderVandaag(); };

const wStart = $("weight-start");
const wEnd = $("weight-end");
wStart.value = state.weightStart ?? "";
wEnd.value = state.weightEnd ?? "";
wStart.onchange = () => { state.weightStart = wStart.value ? Number(wStart.value) : null; saveState(state); };
wEnd.onchange = () => { state.weightEnd = wEnd.value ? Number(wEnd.value) : null; saveState(state); };

$("reset-btn").onclick = () => {
  if (confirm("Weet je zeker dat je het hele logboek wist?")) { resetState(); location.reload(); }
};
