// tests/logic.test.js
import { describe, it, expect } from "vitest";
import { daysBetween, computeProgress } from "../src/logic.js";
import { isWeekday, defaultDroog, emptyDayLog } from "../src/logic.js";

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
