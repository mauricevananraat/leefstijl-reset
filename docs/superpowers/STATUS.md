# Status — Leefstijl Reset

**Laatst bijgewerkt:** 2026-06-17

## Waar we staan
- Brainstorm + ontwerp: **klaar en goedgekeurd** → `docs/superpowers/specs/2026-06-17-leefstijl-reset-design.md`
- Implementatieplan: **klaar, zelf-gereviewd** → `docs/superpowers/plans/2026-06-17-leefstijl-reset.md`
- **Alle 12 taken gebouwd** (subagent-gedreven, TDD op de logica), per-taak + brede eind-review gedaan, alle bevindingen gefixt. **27 tests groen.**
- Branch `feature/leefstijl-reset` gemerged naar `master`.
- **Live gehost via GitHub Pages:** https://mauricevananraat.github.io/leefstijl-reset/
  (publieke repo `mauricevananraat/leefstijl-reset`; site-branch `gh-pages` = gebouwde `dist/`).

## Nog open (Maurice)
- Telefoontest doorlopen → `reports/telefoontest-2026-06-17.md`.
- Content bevestigen: werktitel, variant in week 2, concrete dagmenu's (nu concept in `src/content.js`).
- Optioneel later: eigen app-icoon (`manifest.webmanifest` → `icons` is nu leeg).

## Besluiten (kern)
- Levering: één los `index.html`, gehost als statische site, op het beginscherm.
- Dag-logica: app rekent dag/week uit vanaf startdatum, opent op vandaag.
- Variant Zwaar/Rustig: 1 grote tik per dag, onthoudt keuze.
- Bijhouden: maaltijden, droge dag (default doordeweeks droog), slaap (stepper), stress (Laag/Mid/Hoog), gewicht Dag 1 + Dag 7.
- Opslag: localStorage. Geen backend/accounts/externe libraries.
- TDD op `src/logic.js` (Vitest); UI handmatig op telefoon verifiëren.

## Volgende stap (na /compact)
Uitvoeren volgens **subagent-driven-development**, te beginnen bij **Task 1**
(projectopzet + Vitest-harness) uit het plan. Werk taak voor taak, review tussendoor.

## Openstaande content-vragen (vóór/tijdens Task 5)
- Werktitel "Leefstijl Reset" definitief?
- Geldt variant Zwaar/Rustig ook in Week 2?
- Concrete dagmenu's bevestigen (huidige content is concept op basis van principes).
