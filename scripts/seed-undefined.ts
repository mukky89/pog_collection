/**
 * Seed pre kolekciu **Nezaradené (Undefined)** — capy z fotiek zbierky, ktoré
 * sa zatiaľ nepodarilo priradiť ku konkrétnej katalógovej sérii.
 *
 * Na rozdiel od `scripts/seed.ts` je NEDEŠTRUKTÍVNY — iba upsertne kolekciu,
 * jej capy a stav vlastníctva, takže sa dá spúšťať opakovane.
 *
 * Obrázky capov sú **vystrihnuté priamo z fotiek**, ktoré poslal používateľ
 * (uložené v `public/pogs/undefined/`, manifest `scripts/undefined-caps.json`).
 * Keďže pre tieto capy nemáme katalógový zdroj, zadná strana ostáva
 * placeholder (nič negenerujeme). Akonáhle sa cap identifikuje, presunie sa
 * do vlastnej kolekcie s originálnymi obrázkami.
 *
 * Všetky capy z fotiek = vlastnené (na fotke sú), počet kusov 1.
 *
 * Spustenie:  npm run seed:undefined
 */
import mongoose from "mongoose";
import { readFileSync } from "node:fs";
import { join } from "node:path";

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { config } = require("dotenv");
  config({ path: ".env.local" });
  config();
} catch {
  /* dotenv nie je dostupný (produkcia) — použijeme process.env */
}

import CollectionModel from "../lib/models/Collection";
import PogModel from "../lib/models/Pog";
import UserCollectionModel from "../lib/models/UserCollection";

const SLUG = "undefined";
const PLACEHOLDER = "/placeholder-pog.svg";

type Cap = { seq: number; page: number; pos: number; image: string };

function loadCaps(): Cap[] {
  const file = join(process.cwd(), "scripts", "undefined-caps.json");
  const data = JSON.parse(readFileSync(file, "utf-8"));
  return (data.caps ?? []) as Cap[];
}

async function upsertCollection(data: {
  name: string;
  slug: string;
  description: string;
  year: number;
  manufacturer: string;
  totalItems: number;
  coverImage?: string;
}) {
  return CollectionModel.findOneAndUpdate(
    { slug: data.slug },
    { $set: { ...data, coverImage: data.coverImage ?? PLACEHOLDER } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function upsertPog(args: {
  collectionId: mongoose.Types.ObjectId;
  name: string;
  number: number;
  imageUrl: string;
  quantity: number;
}) {
  const pog = await PogModel.findOneAndUpdate(
    { collectionId: args.collectionId, number: args.number },
    {
      $set: {
        name: args.name,
        collectionId: args.collectionId,
        number: args.number,
        rarity: "common",
        price: 0,
        imageUrl: args.imageUrl,
        // Bez katalógového zdroja nemáme originálnu zadnú stranu → placeholder.
        imageBackUrl: PLACEHOLDER,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  if (args.quantity > 0) {
    await UserCollectionModel.findOneAndUpdate(
      { pogId: pog._id },
      {
        $set: {
          pogId: pog._id,
          owned: true,
          quantity: args.quantity,
          condition: "good",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  return pog;
}

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Chýba MONGODB_URI");

  const caps = loadCaps();
  if (!caps.length) throw new Error("Manifest undefined-caps.json je prázdny");

  await mongoose.connect(uri);
  console.log("Pripojené k databáze.");

  const coll = await upsertCollection({
    name: "Nezaradené (Undefined)",
    slug: SLUG,
    description:
      "Capy z fotiek zbierky, ktoré zatiaľ nie sú priradené ku konkrétnej " +
      "sérii. Obrázky sú vystrihnuté z pôvodných fotiek. Po identifikácii " +
      "sa cap presunie do vlastnej kolekcie.",
    year: 1995,
    manufacturer: "Rôzni výrobcovia",
    totalItems: caps.length,
    coverImage: caps[0]?.image ?? PLACEHOLDER,
  });

  let pieces = 0;
  for (const cap of caps) {
    await upsertPog({
      collectionId: coll._id,
      name: `Cap ${cap.page}-${String(cap.pos).padStart(2, "0")}`,
      number: cap.seq,
      imageUrl: cap.image,
      quantity: 1,
    });
    pieces += 1;
  }

  console.log(
    `Nezaradené (Undefined): ${caps.length} capov z fotiek, ` +
      `všetky vlastnené (${pieces} ks).`
  );
  console.log("Hotovo! ✅");
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
