# Leefstijl Reset Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Een mobiele mini-web-app (één los `index.html`, gehost als statische site, op het beginscherm) die Maurice door een 14-daags leefstijl-startplan begeleidt met minimale dagelijkse invoer en een lokaal logboek.

**Architecture:** Pure, DOM-loze logica (dag/week-berekening, opslag-schema, weekcijfers) in `src/logic.js`, volledig unit-getest met Vitest. UI-bedrading in `src/app.js` leunt op die logica en wordt handmatig op de telefoon geverifieerd. Een mini Node-buildscript (`build.mjs`) inlinet CSS + JS in `dist/index.html` zodat het eindproduct één zelfstandig bestand is zonder runtime-build.

**Tech Stack:** Vanilla HTML/CSS/JS (geen framework), Vitest (logica-tests, Node-omgeving), Node uit `C:\Users\Maurice van Anraat\Documents\.claudeV2\nodejs`.

## Global Constraints

- Mobile-first: grote tikbare elementen, leesbaar zonder zoomen, duimbediening.
- Taal Nederlands, nuchtere toon (geen betuttelende fitness-taal).
- Geen backend, geen accounts, geen cloud-sync. Werkt offline na openen.
- Geen externe runtime-dependencies (ook geen CDN-grafiek-library); overzicht met inline CSS.
- Opslag uitsluitend via `localStorage`, key-prefix `leefstijl-reset:v1`.
- Eindproduct = één zelfstandig `dist/index.html` (alle CSS + JS inline).
- Plan = 14 dagen: Dag 1–7 = Week 1, Dag 8–14 = Week 2.
- Medische disclaimer zichtbaar in de app.
- Toon altijd volledige testoutput als bewijs vóór "klaar" wordt geclaimd.

---

## File Structure

- `package.json` — Vitest-scripts, ES-module config.
- `src/logic.js` — pure functies: dag/week-berekening, default droge dag, leeg dag-log, weekcijfers. Geen DOM, geen `localStorage`.
- `src/storage.js` — dunne wrapper rond `localStorage` (lezen/schrijven JSON). Roept `logic.js` aan.
- `src/content.js` — data: maaltijdschema per week + variant, en de basisregels. Door Maurice te corrigeren.
- `src/app.js` — DOM-bedrading (schermen, knoppen, render). Leunt op `logic.js`, `storage.js`, `content.js`.
- `src/styles.css` — mobile-first CSS.
- `index.html` — markup + `<link>`/`<script src>` naar bovenstaande (dev-versie).
- `build.mjs` — inlinet CSS + JS in `dist/index.html` (productie, één bestand).
- `tests/logic.test.js` — unit-tests voor `src/logic.js`.
- `tests/content.test.js` — structuur-validatie voor `src/content.js`.

---

### Task 1: Projectopzet + test-harness

**Files:**
- Create: `package.json`
- Create: `tests/smoke.test.js`
- Create: `src/logic.js` (leeg startpunt met één export)

**Interfaces:**
- Consumes: niets.
- Produces: werkende `npm test` (Vitest), ES-module opzet (`"type": "module"`).

- [ ] **Step 1: Schrijf `package.json`**

```json
{
  "name": "leefstijl-reset",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "build": "node build.mjs"
  },
  "devDependencies": {
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Installeer dependencies**

Run: `npm install`
Expected: `node_modules/` aangemaakt, geen errors.

- [ ] **Step 3: Schrijf een smoke-test**

```javascript
// tests/smoke.test.js
import { describe, it, expect } from "vitest";
import { ping } from "../src/logic.js";

describe("harness", () => {
  it("returns pong", () => {
    expect(ping()).toBe("pong");
  });
});
```

- [ ] **Step 4: Run en zie 'm falen**

Run: `npm test`
Expected: FAIL — `ping` is not exported / not defined.

- [ ] **Step 5: Minimale implementatie**

```javascript
// src/logic.js
export function ping() {
  return "pong";
}
```

- [ ] **Step 6: Run en zie 'm slagen**

Run: `npm test`
Expected: PASS (1 test).

- [ ] **Step 7: Commit**

```bash
git init
git add package.json tests/smoke.test.js src/logic.js .gitignore
git commit -m "chore: project setup met Vitest harness"
```

> Let op: voer eerst `git init` uit als het project nog geen git heeft. Als git ongewenst is, sla de commit-stappen in dit plan over en houd voortgang bij via de checkboxes.

---

### Task 2: Dag/week-berekening (TDD)

**Files:**
- Modify: `src/logic.js`
- Test: `tests/logic.test.js`

**Interfaces:**
- Consumes: niets.
- Produces:
  - `daysBetween(startISO, todayISO) -> number` (hele dagen, kan negatief).
  - `computeProgress(startISO, todayISO) -> { dayNumber, week, beforeStart, afterPlan }`
    - `dayNumber`: 1..14 op geldige dagen; `week`: 1 (dag 1–7) of 2 (dag 8–14).
    - `beforeStart: true` als today vóór startdatum ligt.
    - `afterPlan: true` als today na dag 14 ligt.

- [ ] **Step 1: Schrijf falende tests**

```javascript
// tests/logic.test.js
import { describe, it, expect } from "vitest";
import { daysBetween, computeProgress } from "../src/logic.js";

describe("daysBetween", () => {
  it("is 0 op dezelfde dag", () => {
    expect(daysBetween("2026-06-17", "2026-06-17")).toBe(0);
  });
  it("telt hele dagen vooruit", () => {
    expect(daysBetween("2026-06-17", "2026-06-20")).toBe(3);
  });
  it("is negatief vóór de startdatum", () => {
    expect(daysBetween("2026-06-17", "2026-06-16")).toBe(-1);
  });
  it("rekent over een maandgrens", () => {
    expect(daysBetween("2026-06-30", "2026-07-02")).toBe(2);
  });
});

describe("computeProgress", () => {
  it("dag 1 week 1 op de startdatum", () => {
    const p = computeProgress("2026-06-17", "2026-06-17");
    expect(p).toMatchObject({ dayNumber: 1, week: 1, beforeStart: false, afterPlan: false });
  });
  it("dag 7 is nog week 1", () => {
    expect(computeProgress("2026-06-17", "2026-06-23").week).toBe(1);
  });
  it("dag 8 is week 2", () => {
    const p = computeProgress("2026-06-17", "2026-06-24");
    expect(p).toMatchObject({ dayNumber: 8, week: 2 });
  });
  it("markeert vóór de start", () => {
    expect(computeProgress("2026-06-17", "2026-06-15").beforeStart).toBe(true);
  });
  it("markeert na dag 14", () => {
    expect(computeProgress("2026-06-17", "2026-07-05").afterPlan).toBe(true);
  });
});
```

- [ ] **Step 2: Run en zie ze falen**

Run: `npm test`
Expected: FAIL — `daysBetween` / `computeProgress` niet gedefinieerd.

- [ ] **Step 3: Implementeer**

```javascript
// src/logic.js — toevoegen onder ping()
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
```

- [ ] **Step 4: Run en zie ze slagen**

Run: `npm test`
Expected: PASS (smoke + alle nieuwe tests).

- [ ] **Step 5: Commit**

```bash
git add src/logic.js tests/logic.test.js
git commit -m "feat: dag/week-berekening vanaf startdatum"
```

---

### Task 3: Dag-log schema + default droge dag (TDD)

**Files:**
- Modify: `src/logic.js`
- Modify: `tests/logic.test.js`

**Interfaces:**
- Consumes: niets.
- Produces:
  - `isWeekday(iso) -> boolean` (ma–vr).
  - `defaultDroog(iso) -> boolean` (doordeweeks `true`).
  - `emptyDayLog(iso) -> { variant, meals:{ontbijt,lunch,avond}, droog, sleep, stress }`
    - `variant: "rustig"` default, `meals` alle `false`, `droog = defaultDroog(iso)`, `sleep: null`, `stress: null`.

- [ ] **Step 1: Schrijf falende tests**

```javascript
// tests/logic.test.js — toevoegen
import { isWeekday, defaultDroog, emptyDayLog } from "../src/logic.js";

describe("isWeekday", () => {
  it("herkent een woensdag als doordeweeks", () => {
    expect(isWeekday("2026-06-17")).toBe(true); // wo
  });
  it("herkent zaterdag als weekend", () => {
    expect(isWeekday("2026-06-20")).toBe(false); // za
  });
  it("herkent zondag als weekend", () => {
    expect(isWeekday("2026-06-21")).toBe(false); // zo
  });
});

describe("defaultDroog", () => {
  it("is droog op een doordeweekse dag", () => {
    expect(defaultDroog("2026-06-17")).toBe(true);
  });
  it("is niet automatisch droog in het weekend", () => {
    expect(defaultDroog("2026-06-20")).toBe(false);
  });
});

describe("emptyDayLog", () => {
  it("geeft veilige defaults met droog doordeweeks", () => {
    expect(emptyDayLog("2026-06-17")).toEqual({
      variant: "rustig",
      meals: { ontbijt: false, lunch: false, avond: false },
      droog: true,
      sleep: null,
      stress: null,
    });
  });
});
```

- [ ] **Step 2: Run en zie ze falen**

Run: `npm test`
Expected: FAIL — functies niet gedefinieerd.

- [ ] **Step 3: Implementeer**

```javascript
// src/logic.js — toevoegen
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
```

- [ ] **Step 4: Run en zie ze slagen**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/logic.js tests/logic.test.js
git commit -m "feat: dag-log schema met slimme droge-dag default"
```

---

### Task 4: Weekcijfers / aggregatie (TDD)

**Files:**
- Modify: `src/logic.js`
- Modify: `tests/logic.test.js`

**Interfaces:**
- Consumes: dag-logs uit `emptyDayLog`-vorm.
- Produces:
  - `summarize(daysObj) -> { dryDays, avgSleep, completedMeals, totalMeals, stress:{laag,mid,hoog} }`
    - `daysObj`: map van ISO-datum → dag-log.
    - `avgSleep`: gemiddelde van niet-null `sleep`, of `null` als geen.
    - `completedMeals`/`totalMeals`: getikt vs. totaal (3 per gelogde dag).
  - `weightDelta(start, end) -> number | null` (`end - start`, of `null` als één ontbreekt).

- [ ] **Step 1: Schrijf falende tests**

```javascript
// tests/logic.test.js — toevoegen
import { summarize, weightDelta } from "../src/logic.js";

describe("summarize", () => {
  const days = {
    "2026-06-17": { variant: "zwaar", meals: { ontbijt: true, lunch: true, avond: false }, droog: true, sleep: 7, stress: "mid" },
    "2026-06-18": { variant: "rustig", meals: { ontbijt: true, lunch: false, avond: false }, droog: false, sleep: 6, stress: "hoog" },
  };
  it("telt droge dagen", () => {
    expect(summarize(days).dryDays).toBe(1);
  });
  it("middelt slaap over gelogde dagen", () => {
    expect(summarize(days).avgSleep).toBe(6.5);
  });
  it("telt voltooide en totale maaltijden", () => {
    const s = summarize(days);
    expect(s.completedMeals).toBe(3);
    expect(s.totalMeals).toBe(6);
  });
  it("telt stress per niveau", () => {
    expect(summarize(days).stress).toEqual({ laag: 0, mid: 1, hoog: 1 });
  });
  it("geeft avgSleep null bij geen slaapdata", () => {
    const empty = { "2026-06-17": { meals: {}, sleep: null, stress: null, droog: false } };
    expect(summarize(empty).avgSleep).toBe(null);
  });
});

describe("weightDelta", () => {
  it("rekent verschil eind minus start", () => {
    expect(weightDelta(92, 90.5)).toBe(-1.5);
  });
  it("is null als een waarde ontbreekt", () => {
    expect(weightDelta(92, null)).toBe(null);
  });
});
```

- [ ] **Step 2: Run en zie ze falen**

Run: `npm test`
Expected: FAIL — `summarize` / `weightDelta` niet gedefinieerd.

- [ ] **Step 3: Implementeer**

```javascript
// src/logic.js — toevoegen
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
```

- [ ] **Step 4: Run en zie ze slagen**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/logic.js tests/logic.test.js
git commit -m "feat: weekcijfers en gewichtsverschil"
```

---

### Task 5: Content-data + structuurvalidatie (TDD-light)

**Files:**
- Create: `src/content.js`
- Test: `tests/content.test.js`

**Interfaces:**
- Consumes: niets.
- Produces:
  - `BASISREGELS: string[]` — de altijd-zichtbare reminders.
  - `MEALS` — `{ 1: { zwaar:{ontbijt,lunch,avond}, rustig:{...} }, 2: {...} }` (week → variant → maaltijdteksten).
  - `getMeals(week, variant) -> {ontbijt,lunch,avond}`.

> **Belangrijk:** de menu-teksten hieronder zijn **concept-invulling op basis van de principes uit de spec** (sectie 8). Markeer ze als "concept — door Maurice te bevestigen". Claude verzint geen definitief dieet.

- [ ] **Step 1: Schrijf falende tests**

```javascript
// tests/content.test.js
import { describe, it, expect } from "vitest";
import { BASISREGELS, MEALS, getMeals } from "../src/content.js";

describe("content", () => {
  it("heeft basisregels", () => {
    expect(Array.isArray(BASISREGELS)).toBe(true);
    expect(BASISREGELS.length).toBeGreaterThan(0);
  });
  it("heeft beide weken en beide varianten met 3 maaltijden", () => {
    for (const week of [1, 2]) {
      for (const variant of ["zwaar", "rustig"]) {
        const m = getMeals(week, variant);
        expect(Object.keys(m).sort()).toEqual(["avond", "lunch", "ontbijt"]);
        for (const v of Object.values(m)) expect(typeof v).toBe("string");
      }
    }
  });
});
```

- [ ] **Step 2: Run en zie ze falen**

Run: `npm test`
Expected: FAIL — `src/content.js` bestaat niet.

- [ ] **Step 3: Implementeer (concept-content)**

```javascript
// src/content.js
// CONCEPT-invulling op basis van de spec-principes. Door Maurice te bevestigen.
export const BASISREGELS = [
  "Eiwit bij elke maaltijd",
  "Veel water drinken",
  "Koffie spreiden (maagzuur)",
  "Doordeweeks geen alcohol",
  "Niet zwaar eten vlak voor slapen",
  "Slaap 6,5–7u heeft prioriteit",
  "Beweging week 1: rustig wandelen",
];

export const MEALS = {
  1: {
    zwaar: {
      ontbijt: "Eiwitshake",
      lunch: "Eiwitshake",
      avond: "Eiwitrijk avondmaal met zetmeel (bijv. rijst/aardappel) + groente",
    },
    rustig: {
      ontbijt: "Eiwitshake",
      lunch: "Eiwitshake",
      avond: "Eiwitrijk avondmaal, weinig/geen zetmeel + groente",
    },
  },
  2: {
    zwaar: {
      ontbijt: "Kwark met fruit",
      lunch: "Eiwit + groente, met wat zetmeel",
      avond: "Vlees/vis + groente + zetmeel",
    },
    rustig: {
      ontbijt: "Kwark met fruit",
      lunch: "Eiwit + groente",
      avond: "Vlees/vis + groente, weinig/geen zetmeel",
    },
  },
};

export function getMeals(week, variant) {
  return MEALS[week][variant];
}
```

- [ ] **Step 4: Run en zie ze slagen**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/content.js tests/content.test.js
git commit -m "feat: concept-maaltijdcontent + basisregels (te bevestigen)"
```

---

### Task 6: localStorage-wrapper

**Files:**
- Create: `src/storage.js`

**Interfaces:**
- Consumes: `emptyDayLog` uit `logic.js`.
- Produces:
  - `loadState() -> { startDate, weightStart, weightEnd, days }` (defaults bij leeg).
  - `saveState(state) -> void`.
  - `resetState() -> void`.
  - `getDayLog(state, iso) -> dayLog` (maakt aan via `emptyDayLog` als afwezig).

> Geen aparte unit-test: dit is een dunne I/O-wrapper rond browser-`localStorage` (niet beschikbaar in Node zonder mock). Wordt geverifieerd in de telefoontest (Task 11). Houd de logica hier minimaal; alle rekenlogica zit al getest in `logic.js`.

- [ ] **Step 1: Implementeer**

```javascript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/storage.js
git commit -m "feat: localStorage-wrapper voor app-state"
```

---

### Task 7: HTML-skelet + mobile-first CSS

**Files:**
- Create: `index.html`
- Create: `src/styles.css`

**Interfaces:**
- Produces: schermstructuur met 3 secties (Vandaag / Overzicht / Instellingen) en een onderbalk-navigatie. Nog geen data-bedrading.

- [ ] **Step 1: Schrijf `index.html`-skelet**

```html
<!doctype html>
<html lang="nl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <title>Leefstijl Reset</title>
  <link rel="stylesheet" href="src/styles.css" />
</head>
<body>
  <main id="app">
    <section id="screen-vandaag" class="screen">
      <header class="day-header"><h1 id="day-title">Vandaag</h1><p id="day-date"></p></header>
      <button id="variant-btn" class="big-btn">Rustige dag</button>
      <ul id="meal-list" class="checklist"></ul>
      <div class="trackers">
        <div class="tracker" id="tracker-droog"></div>
        <div class="tracker" id="tracker-sleep"></div>
        <div class="tracker" id="tracker-stress"></div>
      </div>
      <section class="basisregels"><h2>Basisregels</h2><ul id="rules-list"></ul></section>
    </section>

    <section id="screen-overzicht" class="screen hidden">
      <h1>Overzicht</h1>
      <div id="summary-tiles" class="tiles"></div>
    </section>

    <section id="screen-instellingen" class="screen hidden">
      <h1>Instellingen</h1>
      <label>Startdatum <input type="date" id="start-date" /></label>
      <label>Gewicht start (kg) <input type="number" step="0.1" id="weight-start" /></label>
      <label>Gewicht eind (kg) <input type="number" step="0.1" id="weight-end" /></label>
      <button id="reset-btn" class="danger-btn">Logboek resetten</button>
      <p class="disclaimer">Dit is geen medisch advies. Voel je je futloos of duizelig op een werkdag? Neem dan een echte maaltijd in plaats van een shake.</p>
    </section>
  </main>

  <nav id="tabbar">
    <button data-screen="vandaag" class="active">Vandaag</button>
    <button data-screen="overzicht">Overzicht</button>
    <button data-screen="instellingen">Meer</button>
  </nav>

  <script type="module" src="src/app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Schrijf `src/styles.css` (mobile-first)**

```css
:root {
  --bg: #f6f7f9; --card: #ffffff; --ink: #1f2933; --muted: #6b7280;
  --accent: #2563eb; --ok: #16a34a; --danger: #dc2626; --tap: 56px;
}
* { box-sizing: border-box; }
body {
  margin: 0; font-family: system-ui, sans-serif; color: var(--ink);
  background: var(--bg); padding-bottom: 72px; font-size: 17px;
}
.screen { padding: 16px; }
.hidden { display: none; }
.day-header h1 { margin: 0; font-size: 22px; }
.day-header p { margin: 2px 0 16px; color: var(--muted); }
.big-btn {
  width: 100%; min-height: var(--tap); font-size: 18px; border: none;
  border-radius: 14px; background: var(--accent); color: #fff; margin-bottom: 16px;
}
.checklist { list-style: none; padding: 0; margin: 0 0 16px; }
.checklist li {
  min-height: var(--tap); display: flex; align-items: center; gap: 12px;
  padding: 12px 16px; background: var(--card); border-radius: 14px; margin-bottom: 8px;
}
.checklist li.done { background: #e7f6ec; }
.trackers { display: grid; gap: 8px; margin-bottom: 16px; }
.tracker { background: var(--card); border-radius: 14px; padding: 12px 16px; }
.tracker .seg-btn { min-height: 44px; min-width: 64px; border-radius: 10px; border: 1px solid #d1d5db; background: #fff; }
.tracker .seg-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }
.basisregels { background: var(--card); border-radius: 14px; padding: 12px 16px; }
.tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.tile { background: var(--card); border-radius: 14px; padding: 14px; }
.tile .num { font-size: 24px; font-weight: 700; }
.tile .bar { height: 8px; background: #e5e7eb; border-radius: 4px; margin-top: 8px; }
.tile .bar > span { display: block; height: 100%; background: var(--accent); border-radius: 4px; }
label { display: block; margin: 12px 0; }
input { min-height: var(--tap); width: 100%; font-size: 17px; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 12px; }
.danger-btn { width: 100%; min-height: var(--tap); border: none; border-radius: 14px; background: var(--danger); color: #fff; margin-top: 16px; }
.disclaimer { color: var(--muted); font-size: 14px; margin-top: 16px; }
#tabbar {
  position: fixed; bottom: 0; left: 0; right: 0; display: flex;
  background: #fff; border-top: 1px solid #e5e7eb;
}
#tabbar button { flex: 1; min-height: 64px; border: none; background: none; font-size: 15px; color: var(--muted); }
#tabbar button.active { color: var(--accent); font-weight: 600; }
```

- [ ] **Step 3: Verifieer visueel**

Open `index.html` in de browser (desktop, smal venster ~390px). Check: 3 schermen schakelbaar zodra Task 8 de nav bedraadt; tikvlakken groot; geen horizontale scroll.

- [ ] **Step 4: Commit**

```bash
git add index.html src/styles.css
git commit -m "feat: mobile-first skelet en styling"
```

---

### Task 8: App-bedrading — schermnavigatie + vandaag-scherm rendert

**Files:**
- Create: `src/app.js`

**Interfaces:**
- Consumes: `computeProgress` (logic), `loadState/saveState/getDayLog` (storage), `getMeals/BASISREGELS` (content).
- Produces: werkende tab-navigatie, vandaag-scherm dat datum/dag/week toont, variant-knop, maaltijdchecklist en basisregels rendert vanuit state.

- [ ] **Step 1: Implementeer app.js (render + navigatie)**

```javascript
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
```

- [ ] **Step 2: Verifieer visueel**

Open `index.html`. Zonder startdatum → "Welkom". Tabs schakelen. (Startdatum-invoer komt in Task 9.)

- [ ] **Step 3: Commit**

```bash
git add src/app.js
git commit -m "feat: schermnavigatie en vandaag-scherm render"
```

---

### Task 9: Trackers + instellingen (variant/droog/slaap/stress/startdatum/gewicht/reset)

**Files:**
- Modify: `src/app.js`

**Interfaces:**
- Consumes: bestaande `state`, `saveState`, `resetState`.
- Produces: bedrade trackers (droog toggle, slaap-stepper, stress-segmenten) en instellingen (startdatum, gewicht start/eind, reset met bevestiging).

- [ ] **Step 1: Implementeer trackers-render (in `renderVandaag`, na de basisregels)**

```javascript
// src/app.js — voeg toe binnen renderVandaag(), onder rules
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
```

- [ ] **Step 2: Implementeer instellingen-bedrading (onderaan `app.js`)**

```javascript
// src/app.js — toevoegen onderaan
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
```

Voeg `resetState` toe aan de import bovenaan: `import { loadState, saveState, getDayLog, resetState } from "./storage.js";`

- [ ] **Step 3: Verifieer visueel**

Open in browser: zet startdatum → vandaag-scherm toont Dag/Week + menu's. Tik trackers; herlaad pagina → waarden blijven staan (localStorage).

- [ ] **Step 4: Commit**

```bash
git add src/app.js
git commit -m "feat: trackers en instellingen met persistente opslag"
```

---

### Task 10: Overzicht-scherm

**Files:**
- Modify: `src/app.js`

**Interfaces:**
- Consumes: `summarize`, `weightDelta` (logic), `state`.
- Produces: gevulde `renderOverzicht()` met tegels + CSS-balkjes.

- [ ] **Step 1: Vervang de lege `renderOverzicht`**

```javascript
// src/app.js — vervang de stub
import { summarize, weightDelta } from "./logic.js"; // voeg toe aan bestaande logic-import

function renderOverzicht() {
  const s = summarize(state.days);
  const wd = weightDelta(state.weightStart, state.weightEnd);
  const pct = s.totalMeals ? Math.round((s.completedMeals / s.totalMeals) * 100) : 0;
  const tiles = [
    { num: s.dryDays, label: "droge dagen" },
    { num: s.avgSleep ?? "–", label: "gem. slaap (u)" },
    { num: `${s.completedMeals}/${s.totalMeals}`, label: "maaltijden", bar: pct },
    { num: `${s.stress.laag}/${s.stress.mid}/${s.stress.hoog}`, label: "stress L/M/H" },
    { num: wd === null ? "–" : `${wd > 0 ? "+" : ""}${wd}`, label: "gewicht (kg)" },
  ];
  document.getElementById("summary-tiles").innerHTML = tiles.map((t) =>
    `<div class="tile"><div class="num">${t.num}</div><div>${t.label}</div>${
      t.bar !== undefined ? `<div class="bar"><span style="width:${t.bar}%"></span></div>` : ""
    }</div>`
  ).join("");
}
```

> Let op: combineer de `summarize`/`weightDelta`-import met de bestaande `import { computeProgress } from "./logic.js";` tot één regel, geen dubbele import.

- [ ] **Step 2: Verifieer visueel**

Open Overzicht-tab na het loggen van wat data → tegels tonen cijfers, maaltijd-balk vult.

- [ ] **Step 3: Commit**

```bash
git add src/app.js
git commit -m "feat: overzicht-scherm met weekcijfers"
```

---

### Task 11: Single-file build + telefoontest

**Files:**
- Create: `build.mjs`
- Create: `dist/index.html` (output)

**Interfaces:**
- Consumes: `index.html`, `src/styles.css`, alle `src/*.js`.
- Produces: één zelfstandig `dist/index.html` met inline CSS + JS (ES-modules samengevoegd).

- [ ] **Step 1: Schrijf `build.mjs`**

```javascript
// build.mjs — inlinet CSS en JS-modules in één bestand
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const css = readFileSync("src/styles.css", "utf8");
// Modules in afhankelijkheidsvolgorde; strip import/export voor inline-bundel
const order = ["logic", "content", "storage", "app"];
let js = "";
for (const name of order) {
  let src = readFileSync(`src/${name}.js`, "utf8");
  src = src.replace(/^\s*import[^;]*;\s*$/gm, "");
  src = src.replace(/^export\s+/gm, "");
  js += `\n// --- ${name}.js ---\n` + src + "\n";
}
let html = readFileSync("index.html", "utf8");
html = html.replace(/<link rel="stylesheet"[^>]*>/, `<style>\n${css}\n</style>`);
html = html.replace(/<script type="module"[^>]*><\/script>/, `<script>\n${js}\n</script>`);
mkdirSync("dist", { recursive: true });
writeFileSync("dist/index.html", html);
console.log("dist/index.html gebouwd:", html.length, "tekens");
```

> **Verificatie-eis:** `logic.js`, `content.js`, `storage.js` mogen alleen elkaar importeren (geen externe imports), zodat het strippen van import-regels veilig is. Controleer na build dat `dist/index.html` geen `import`/`export` meer bevat.

- [ ] **Step 2: Run de build + testsuite**

Run: `npm test && npm run build`
Expected: alle tests PASS; `dist/index.html gebouwd: <n> tekens`.

- [ ] **Step 3: Telefoontest (handmatig, met bewijs)**

Open `dist/index.html` lokaal (of via tijdelijke hosting) op de telefoon. Checklist:
- Startdatum instellen → opent op juiste Dag/Week.
- Variant-knop wisselt en onthoudt.
- Maaltijden afvinken, trackers tikken.
- App sluiten/heropenen → data blijft staan.
- Overzicht klopt. Reset werkt.
- Tikvlakken groot genoeg, geen zoom nodig.

Noteer bevindingen in `reports/telefoontest-2026-06-17.md`.

- [ ] **Step 4: Commit**

```bash
git add build.mjs dist/index.html reports/
git commit -m "build: single-file output + telefoontest-rapport"
```

---

### Task 12: Hosting + beginscherm-icoon

**Files:**
- Create: `dist/manifest.webmanifest`
- Modify: `index.html` (manifest + theme-color meta, opnieuw builden)

**Interfaces:**
- Produces: installeerbaar als beginscherm-icoon (PWA-light, geen offline-service-worker nodig).

- [ ] **Step 1: Voeg manifest + meta toe aan `index.html` `<head>`**

```html
<meta name="theme-color" content="#2563eb" />
<link rel="manifest" href="manifest.webmanifest" />
```

- [ ] **Step 2: Schrijf `dist/manifest.webmanifest`**

```json
{
  "name": "Leefstijl Reset",
  "short_name": "Reset",
  "start_url": ".",
  "display": "standalone",
  "background_color": "#f6f7f9",
  "theme_color": "#2563eb",
  "icons": []
}
```

- [ ] **Step 3: Hosting-keuze met Maurice**

Bespreek hosting (bijv. GitHub Pages: repo → Settings → Pages → bron `dist/`). Dit is een eenmalige stap; documenteer de URL in `README.md`. Op de telefoon: open URL → browsermenu → "Toevoegen aan beginscherm".

- [ ] **Step 4: Build + commit**

```bash
npm run build
git add index.html dist/ README.md
git commit -m "feat: beginscherm-icoon (manifest) + hosting-notitie"
```

---

## Self-Review (uitgevoerd)

**Spec-dekking:** Levering/hosting → Task 12. Dag-logica auto → Task 2/8. Variant 1-tik → Task 8/9. Trackers (maaltijden/droog/slaap/stress) → Task 9. Gewicht start/eind → Task 9. Overzicht → Task 10. localStorage → Task 6. Disclaimer → Task 7. Eén-bestand → Task 11. Content concept + door Maurice te bevestigen → Task 5. Alle spec-secties hebben een task.

**Placeholders:** Geen TBD/TODO; concept-content is bewust gemarkeerd als te bevestigen, niet als placeholder.

**Type-consistentie:** `emptyDayLog`-vorm (`variant/meals/droog/sleep/stress`) consistent gebruikt in Task 3, 6, 8, 9; `summarize`-velden consistent in Task 4 en 10; `computeProgress`-velden (`dayNumber/week/beforeStart/afterPlan`) consistent in Task 2 en 8.

## Openstaande content-vragen (vóór of tijdens Task 5)

- Werktitel "Leefstijl Reset" definitief?
- Geldt de variant Zwaar/Rustig ook in Week 2 (zo niet: één schema voor week 2)?
- Concrete menu's per dag bevestigen/aanpassen.
