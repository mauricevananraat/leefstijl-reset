# Leefstijl Reset — Ontwerp (spec)

**Datum:** 2026-06-17
**Status:** Goedgekeurd ontwerp — klaar voor implementatieplan
**Project:** `projects/prive/fysieke-verbetertraject`
**Werktitel app:** Leefstijl Reset

---

## 1. Doel & uitgangspunten

Een persoonlijk leefstijl-/afslank-startplan omgezet naar één mobiele mini-web-app
die Maurice dagelijks op zijn telefoon gebruikt. Kernprincipe boven alles:

> **Zo min mogelijk invulwerk.** Bij elke keuze geldt: een slimme automatische
> oplossing is beter dan nog een veld om in te vullen.

Niet-onderhandelbaar:
- Mobile-first, grote tikbare elementen, leesbaar zonder zoomen, duimbediening.
- Nederlands, nuchtere toon (geen betuttelende fitness-taal).
- Geen backend, geen accounts, geen cloud-sync.
- Werkt offline na openen.
- Medische disclaimer zichtbaar.

## 2. Levering & techniek

- **Één HTML-bestand**, alle CSS + JS inline, geen externe dependencies
  (ook geen CDN-grafiek-library — overzicht wordt met inline CSS gebouwd).
- Gehost als statische mini-website (gratis hosting, bijv. GitHub Pages) zodat
  Maurice het via **"toevoegen aan beginscherm"** als app-icoon opent.
  - Reden boven een los `.html`-bestand: 1 tik openen, voelt als app, opslag
    overleeft browser-opschoning beter, en updaten = pushen + verversen.
- **Opslag:** `localStorage` (expliciet gewenst en toegestaan, want dit draait
  als eigen website/bestand, niet als Claude.ai Artifact).

## 3. Dag-logica (automatisch)

- Maurice voert **1x een startdatum** in (instellingen).
- App berekent zelf: huidige Dag (1–7) en Week (1 of 2), en **opent meteen op
  vandaag**. Week 1 → Week 2 schakelt automatisch na 7 dagen.
- Bladeren naar gisteren/morgen kan, maar standaard zie je vandaag.
- Navigeren naar een specifieke dag/week hoeft nooit handmatig.

## 4. Schermen

### 4.1 Vandaag-scherm (hoofdscherm)
- Kop: "Dag X · Week Y · <weekdag datum>".
- **Variant-knop** "Zware dag / Rustige dag": 1 grote tik per dag, onthoudt
  laatste keuze als standaard. Wisselt te veel om vast weekpatroon te gebruiken.
- **Maaltijdchecklist** voor die dag + variant (grote tikvlakken per maaltijdrij).
- **Snelle trackers** onderaan:
  - Droge dag — doordeweeks default "droog", alleen bij uitzondering 1 tik.
  - Slaap-uren — stepper (geen toetsenbord), onthoudt vorige waarde.
  - Stressniveau — Laag / Gemiddeld / Hoog, 1 tik.
- **Basisregels** altijd zichtbaar als rustige reminder/checklist (water, eiwit
  elke maaltijd, koffie spreiden i.v.m. maagzuur, niet zwaar eten voor slapen,
  slaap 6,5–7u prioriteit, doordeweeks droog, beweging week 1 = rustig wandelen).
  > Bewust GEEN losse afvink-checkbox per basisregel — dat is te veel tikwerk.
  > Het zijn reminders, geen log-items.

### 4.2 Overzicht-scherm
Weekcijfers in schone tegels + simpele inline CSS-balkjes (geen library):
- Aantal droge dagen
- Gemiddelde slaap
- Voltooide maaltijden
- Stress-patroon over de week
- Gewicht start → eind (verschil)

### 4.3 Instellingen
- Startdatum (1x instellen, aanpasbaar).
- Reset-knop (logboek leegmaken, met bevestiging).
- Medische disclaimer-regel: dit is geen medisch advies; bij futloosheid/
  duizeligheid op een werkdag een echte maaltijd nemen i.p.v. shake.

## 5. Wat wordt opgeslagen (localStorage)

Per dag:
- maaltijden afgevinkt (per maaltijd)
- gekozen variant (zwaar/rustig)
- droge dag (ja/nee)
- slaap-uren
- stressniveau (laag/mid/hoog)

Eenmalig / apart:
- startdatum
- gewicht Dag 1 en Dag 7

## 6. Dagelijkse invoer-telling (toetsing aan kern-eis)

~6 tikjes per dag, **geen typen**:
variant (1) + 3 maaltijden (3) + droge dag (0–1) + slaap (1) + stress (1).
Gewicht alleen op Dag 1 en Dag 7.

## 7. Buiten scope (bewust niet bouwen)

- Accounts, cloud-sync, backend.
- Calorieënteller.
- Krachttrainingsschema (komt later).
- Roken-tracking (week 1 alleen eten + slaap + droog).
- Losse afvink-checkbox per basisregel.

## 8. Content (apart, met Maurice)

Sectie 1 van het overdrachtsdocument geeft **principes**, geen letterlijk menu
per dag. In de content-fase draaft Claude het plan uit tot concrete dagmenu's
(shakes + maaltijden per dag + variant, week 1 kickstart en week 2 echt eten) en
**Maurice corrigeert**. Claude verzint het dieet niet zelf.

Onderliggend plan (vastgesteld):
- **Week 1 kickstart:** 2 eiwitshakes/dag (ontbijt + lunch) + eiwitrijk laag-
  calorie avondmaal. Tussendoor: fruit, groente, 1 eiwitreep (<5g suiker).
- **Variant A (zware werkdag):** iets meer brandstof, zetmeel 's avonds toegestaan.
- **Variant B (rustige dag):** strakker, weinig/geen zetmeel.
- **Week 2 echt eten:** kwark-ontbijt, eiwit+groente lunch, vlees/vis+groente avond.

## 9. Afwijkingen t.o.v. het overdrachtsdocument (en waarom)

| Document | Ontwerp | Reden |
|----------|---------|-------|
| Los `.html`-bestand op telefoon | Mini-website + beginscherm-icoon | Makkelijker openen, duurzamere opslag |
| Handmatige tabs Dag 1–7 + Week 1/2-toggle | Auto: app rekent dag/week uit, opent op vandaag | Nul navigatie, minder fouten |
| Variant elke dag handmatig kiezen | 1 grote tik/dag met onthouden standaard | Dagen wisselen te veel voor vast patroon |
| Checkbox per basisregel | Basisregels als reminders, niet afvinkbaar | Minder tikwerk |
| Evt. CDN-grafiek-library | Inline CSS-tegels/balkjes | Offline + echt één bestand |
| (niet in document) | Stressniveau toegevoegd als tracker | Door Maurice gevraagd; hangt samen met slaap/maagzuur |

## 10. Vervolg

Implementatieplan via `superpowers:writing-plans`, daarna fasegewijs bouwen met
TDD waar zinvol (datum/dag-berekening en opslag-logica zijn testbaar; UI/styling
in de polijst-fase). Testen op telefoon vóór "klaar".
