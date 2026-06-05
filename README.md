# POG Collector

Webová aplikácia pre zberateľov **POG the Game** predmetov — evidencia
kolekcií, sledovanie vlastnených a chýbajúcich kusov a prehľad o trhovej
hodnote zbierky.

**Tech stack:** Next.js 14 (App Router) · TypeScript · MongoDB + Mongoose ·
Tailwind CSS · shadcn/ui štýl komponentov · Railway-ready

---

## Funkcie

- **Dashboard** — celková hodnota zbierky, kompletnosť, najvzácnejšie kusy,
  porovnanie hodnoty vlastnených vs. chýbajúcich predmetov
- **Kolekcie** — všetky série s progress barmi a filtrami (rok, výrobca, stav)
- **Detail kolekcie** — grid POG-ov s prepínaním *Všetky / Vlastním / Chýba mi*
- **Všetky POG** — vyhľadávanie, filtre, triedenie a grid/list zobrazenie
- **Detail POG** — predná/zadná strana, metadáta, editácia vlastníctva
  (podmienka, zaplatená cena, dátum, poznámky), podobné predmety
- **Admin** — CRUD kolekcií a POG-ov + hromadný CSV import

---

## Spustenie lokálne

```bash
# 1. Inštaluj závislosti
npm install

# 2. Priprav premenné prostredia
cp .env.example .env.local
#   a doplň MONGODB_URI

# 3. (voliteľné) Naplň databázu ukážkovými dátami
npm run seed

# 4. Spusti dev server
npm run dev
```

Aplikácia beží na [http://localhost:3000](http://localhost:3000).

---

## Premenné prostredia

| Premenná | Popis |
|---|---|
| `MONGODB_URI` | Connection string k MongoDB (Atlas alebo lokálny) |
| `NEXT_PUBLIC_APP_URL` | Verejná URL aplikácie |
| `CLOUDINARY_*` | Voliteľné — pre upload obrázkov |

---

## Dátové modely

- **Collection** — séria POG-ov (`name`, `slug`, `year`, `manufacturer`, …)
- **Pog** — jednotlivý POG (`name`, `collectionId`, `number`, `rarity`,
  `price` *v centoch*, `imageUrl`, …)
- **UserCollection** — záznam vlastníctva (`pogId`, `owned`, `condition`,
  `paidPrice`, `notes`, …)

> **Pozn.:** ceny sa ukladajú ako celé čísla v **centoch** (napr. `150` = 1,50 €).
> Pole odkazujúce na kolekciu sa volá `collectionId` (nie `collection`),
> pretože `collection` je v Mongoose rezervovaný názov cesty.

---

## API endpointy

| Metóda | Endpoint | Popis |
|---|---|---|
| `GET/POST` | `/api/collections` | Zoznam (so štatistikami) / vytvorenie |
| `GET/PUT/DELETE` | `/api/collections/[id]` | Detail / edit / zmazanie |
| `GET` | `/api/collections/[id]/pogs` | POG-y v kolekcii |
| `GET/POST` | `/api/pogs` | Zoznam (search/filter/sort) / vytvorenie |
| `GET/PUT/DELETE` | `/api/pogs/[id]` | Detail / edit / zmazanie |
| `GET` | `/api/owned` | Vlastnené POG-y |
| `POST/PUT/DELETE` | `/api/owned/[pogId]` | Označenie / detaily / odznačenie |
| `GET` | `/api/stats` | Dashboard štatistiky |
| `POST` | `/api/import` | Hromadný CSV import |

---

## CSV import

Formát stĺpcov (cena v eurách, tagy oddelené `;`):

```csv
name,collection,number,rarity,price,imageUrl,imageBackUrl,description,tags
Slammer Gold,World POG Federation,1,ultra-rare,49.99,,,Zlatý slammer,kov;limitka
```

Kolekcia sa automaticky vytvorí, ak ešte neexistuje.

---

## Deployment na Railway

1. Pushni kód na GitHub.
2. Na [railway.app](https://railway.app) → **New Project → Deploy from GitHub repo**
   (alebo pridaj službu do existujúceho projektu k MongoDB).
3. Pridaj **MongoDB** službu (Railway plugin) alebo použi MongoDB Atlas.
4. V **Settings → Variables** nastav `MONGODB_URI`.
5. Railway podľa `railway.json` spustí `npm run build` a `npm start`
   (port injektuje cez `PORT`).

### Public vs. interná MONGODB_URI

Railway dáva MongoDB dve adresy:

```bash
# INTERNÁ — použi v Railway Variables (rýchlejšia, bezpečná, bez egress portu)
MONGODB_URI=mongodb://mongo:<heslo>@mongodb.railway.internal:27017

# PUBLIC PROXY — len pre prístup zvonku (lokálny seed/test z tvojho PC)
MONGODB_URI=mongodb://mongo:<heslo>@<subdoména>.proxy.rlwy.net:<port>
```

> V Railway nasadení vždy použi **internú** adresu — funguje vnútri privátnej
> siete projektu. Public proxy port býva blokovaný egress firewallmi.

### Naplnenie dát po nasadení

Dve možnosti:

1. **Admin UI (odporúčané)** — otvor `/admin → CSV Import`, klikni
   *„Vložiť ukážkové dáta"* a *Importovať*. Bez shellu, funguje hneď.
2. **Seed skript z Railway shellu:**

   ```bash
   npx tsx scripts/seed.ts
   ```

   (premenné z prostredia Railway sa použijú automaticky)
