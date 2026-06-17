# Status — Leefstijl Reset

**Laatst bijgewerkt:** 2026-06-17

## Waar we staan
- Brainstorm + ontwerp: **klaar en goedgekeurd** → `docs/superpowers/specs/2026-06-17-leefstijl-reset-design.md`
- Implementatieplan: **klaar, zelf-gereviewd** → `docs/superpowers/plans/2026-06-17-leefstijl-reset.md`
- Git: geïnitialiseerd, eerste commit gemaakt.
- Nog **geen** code gebouwd.

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
