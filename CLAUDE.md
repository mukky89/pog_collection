# Pokyny pre Claude Code

## Pracovný postup (DÔLEŽITÉ)

Pri **každej dokončenej úlohe** v tomto repozitári vždy:

1. **Inkrementuj verziu** v `package.json` (a zosynchronizuj `package-lock.json`):
   - nová funkcia → zvýš *minor* (napr. `1.2.0` → `1.3.0`)
   - oprava/drobnosť → zvýš *patch* (napr. `1.2.0` → `1.2.1`)
2. **Commitni** zmeny na aktuálnu pracovnú (feature) vetvu.
3. **Zmerguj do `main`** — práca sa vždy dostane až do `main` (cez merge,
   bez nutnosti zakladať nový PR, pokiaľ používateľ nepovie inak).

Verzia sa zobrazuje v pätičke cez `lib/version.ts` (`VERSION_LABEL`), takže
po nasadení (Railway buildne z `main`) je nová verzia hneď viditeľná.

## Obrázky pre pogy (DÔLEŽITÉ)

Pri pridávaní **akejkoľvek novej kolekcie / pogov** vždy stiahni aj **reálne
obrázky** (nie placeholder) tak ako doteraz — **vrátane zadných strán capov**:

1. Pridaj set do `SETS` v `scripts/scrape-milkcapmania.ts` (zdroj
   milkcapmania.co.uk) a spusti `npm run scrape` — obrázky (predné aj „Back"
   dizajny) pôjdu do `public/pogs/<slug>/` a zapíšu sa do
   `scripts/milkcapmania-data.json`.
2. **Každý cap musí mať svoju vlastnú zadnú stranu** — nikdy nepoužívaj jednu
   spoločnú pre celý set. Zadky stiahni zo stránky; ak zdroj poskytuje len
   jednu šablónu zadku (napr. milkcapmania má naskenovaný jeden exemplár
   s vytlačeným číslom), **vygeneruj z nej zadok pre každé číslo** (pôvodné
   číslo prebij a vykresli správne) — vzor: `scripts/generate-toy-story-backs.ts`,
   výstup `public/pogs/<slug>/<n>-back.png`.
3. Seed skript danej kolekcie nech mapuje obrázky podľa čísla capu z manifestu
   (`imageUrl` z `/pogs/<slug>/…`) a **vždy nastaví aj `imageBackUrl`** na
   vlastný zadok daného capu (`/pogs/<slug>/<n>-back.png`). Placeholder /
   spoločnú šablónu použij len ako fallback.
4. Stiahnuté aj vygenerované obrázky (predné aj zadné) **commitni** do repozitára.

## Vetvy

`feature` → `claude/vibrant-newton-CzFU9` (default) → `main` (produkcia, Railway).
Pri priamom merge stačí doniesť zmeny až do `main`.

## Užitočné príkazy

- `npm run scrape` — stiahne POG vizuály z milkcapmania.co.uk do `public/pogs/`
  a vygeneruje `scripts/milkcapmania-data.json`.
- `npm run seed` — naplní MongoDB z manifestu (vyžaduje `MONGODB_URI`).
- `npm run dev` / `npm run build` — vývoj / produkčný build.
