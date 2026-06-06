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
2. Seed skript danej kolekcie nech mapuje obrázky podľa čísla capu z manifestu
   (`imageUrl` z `/pogs/<slug>/…`) a **vždy nastaví aj `imageBackUrl`** zo
   „Back" dizajnu setu (spoločná zadná strana, prípadne podľa vzácnosti).
   Placeholder použij len ako fallback.
3. Stiahnuté obrázky (predné aj zadné) **commitni** do repozitára.

## Vetvy

`feature` → `claude/vibrant-newton-CzFU9` (default) → `main` (produkcia, Railway).
Pri priamom merge stačí doniesť zmeny až do `main`.

## Užitočné príkazy

- `npm run scrape` — stiahne POG vizuály z milkcapmania.co.uk do `public/pogs/`
  a vygeneruje `scripts/milkcapmania-data.json`.
- `npm run seed` — naplní MongoDB z manifestu (vyžaduje `MONGODB_URI`).
- `npm run dev` / `npm run build` — vývoj / produkčný build.
