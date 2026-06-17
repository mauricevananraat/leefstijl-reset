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
