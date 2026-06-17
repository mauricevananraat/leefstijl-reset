# Leefstijl Reset

Een persoonlijke 14-daagse leefstijl-app die je helpt met dagelijkse keuzes rondom voeding, slaap, stress en alcohol. Je kiest per dag een variant (Zwaar of Rustig), logt maaltijden en bijhoudt of je droog bent. Na afloop geeft de overzichtspagina een samenvatting van je twee weken.

## Lokaal draaien / testen

Geen server nodig voor ontwikkeling — open `index.html` direct in een browser, of gebruik een lokale static file server:

```bash
# Optie 1: Python (meest beschikbaar)
python -m http.server 8080
# Open: http://localhost:8080

# Optie 2: Node.js (npx)
npx serve .
```

Tests draaien:

```bash
node node_modules/vitest/vitest.mjs run
```

## Bouwen

Genereert `dist/index.html` — een enkel zelfstandig bestand met ingelijnde CSS en JS:

```bash
node build.mjs
```

Output: `dist/index.html` + `dist/manifest.webmanifest`

## Hosting

Live URL: <nog in te vullen>

### Op telefoon als beginscherm-icoon installeren

1. Open de Live URL in Safari (iOS) of Chrome (Android)
2. Tik op het deelmenu (iOS) of de drie puntjes (Android)
3. Kies "Toevoegen aan beginscherm" / "Add to Home Screen"
4. De app start voortaan in standalone-modus (zonder browserbalk)
