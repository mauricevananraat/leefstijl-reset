# Telefoontest — 2026-06-17

## Geautomatiseerde build-verificatie (geslaagd)

`build.mjs` is gedraaid en heeft `dist/index.html` gegenereerd (13 201 tekens). Onderstaande controles zijn allemaal geslaagd:

| Controle | Resultaat |
|----------|-----------|
| Bestand `dist/index.html` aanwezig | OK |
| Geen `import`-keywords meer | OK — 0 gevonden |
| Geen `export`-keywords meer | OK — 0 gevonden |
| Geen `<script type="module"` meer | OK — 0 gevonden |
| Geen `<link rel="stylesheet"` meer | OK — 0 gevonden |
| `<style>`-blok aanwezig (inline CSS) | OK |
| Inline `<script>`-blok aanwezig | OK |
| `computeProgress` inline aanwezig | OK |
| `emptyDayLog` inline aanwezig | OK |
| `summarize` inline aanwezig | OK |
| `loadState` inline aanwezig | OK |
| `getMeals` inline aanwezig | OK |
| `renderVandaag` inline aanwezig | OK |
| `renderOverzicht` inline aanwezig | OK |
| `#screen-vandaag` aanwezig | OK |
| `#screen-overzicht` aanwezig | OK |
| `#screen-instellingen` aanwezig | OK |
| `#tabbar` aanwezig | OK |

Testsuite: **25/25 tests groen** vóór de build.

---

## Handmatige telefoontest — te doen door Maurice

Open `dist/index.html` direct op de telefoon (via USB-bestand-overdracht of lokale server). Voer elke stap uit en zet een kruisje als het werkt.

### Instellen & navigatie

- [ ] Ga naar het tabblad **Meer** en stel een startdatum in (bijv. 7 dagen geleden). Sluit de app, heropen → het **Vandaag**-scherm toont de juiste dag van het schema (Dag X, Week Y).
- [ ] Wissel tussen de drie tabbladen (Vandaag / Overzicht / Meer) — elk tabblad laadt correct zonder fout.

### Variant & maaltijden

- [ ] Tik op de **variant-knop** (Rustige dag / Werkdag / etc.) — de variant wisselt.
- [ ] Sluit de app, heropen → dezelfde variant is nog geselecteerd.
- [ ] Vink twee of drie **maaltijden** af in de lijst — vinkjes verschijnen.
- [ ] Sluit de app, heropen → vinkjes staan er nog.

### Trackers

- [ ] Tik op de **droog/slaap/stress-trackers** en stel een waarde in.
- [ ] Sluit de app, heropen → tracker-waarden zijn bewaard.

### Overzicht

- [ ] Ga naar **Overzicht** — de tegels tonen data van ingevulde dagen (geen lege/kapotte weergave).
- [ ] De voortgang klopt met wat je hebt ingevuld.

### Reset

- [ ] Ga naar **Meer → Logboek resetten** — bevestig de reset.
- [ ] App toont een lege staat (geen oude data meer zichtbaar).

### Bruikbaarheid op mobiel

- [ ] Tikvlakken zijn groot genoeg om zonder zoom te bedienen (minimaal vingerbreedte).
- [ ] Geen automatische zoom bij het tikken op een invoerveld.
- [ ] Tekst is leesbaar zonder in te zoomen.
- [ ] Pagina scrollt soepel verticaal, geen horizontale overflow.

---

## Notities Maurice

_(vul hier bevindingen in tijdens de test)_
