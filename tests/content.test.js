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
