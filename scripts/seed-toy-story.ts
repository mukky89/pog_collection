/**
 * Samostatný seed pre kolekciu **Toy Story Panini Caps** (Panini, 1996).
 *
 * Na rozdiel od `scripts/seed.ts` je tento skript NEDEŠTRUKTÍVNY — nič
 * nemaže, iba upsertne kolekciu, jej capy a stav vlastníctva. Dá sa preto
 * spúšťať opakovane bez straty ostatných dát.
 *
 * Sada (podľa katalógu milkcapmania.co.uk):
 *   • slammery   #1–#8   (8 ks)
 *   • capy       #9–#78  (70 ks)
 *   • spolu      78 ks
 *
 * Vlastnené kusy sú prečítané z fotky zbierky (`OWNED_CAPS`). Slammery #1–#8
 * na fotke nie sú, takže ostávajú ako chýbajúce.
 *
 * Spustenie:  npm run seed:toy-story
 */
import mongoose from "mongoose";

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

const PLACEHOLDER = "/placeholder-pog.svg";

/** Capy, ktoré reálne vlastním (prečítané z fotky zbierky). */
const OWNED_CAPS = new Set<number>([
  9, 15, 17, 21, 22, 23, 29, 30, 31, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42,
  43, 44, 50, 51, 54, 55, 56, 58, 59, 60, 62, 63, 66, 68, 69, 70, 72, 73, 74,
  75, 76, 77, 78,
]);

/** Vytvorí/aktualizuje kolekciu a vráti jej dokument. */
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

/** Upsert capu podľa (kolekcia + číslo) + nastavenie vlastníctva. */
async function upsertPog(args: {
  collectionId: mongoose.Types.ObjectId;
  name: string;
  number: number;
  rarity: "common" | "uncommon" | "rare" | "ultra-rare";
  owned: boolean;
}) {
  const pog = await PogModel.findOneAndUpdate(
    { collectionId: args.collectionId, number: args.number },
    {
      $set: {
        name: args.name,
        collectionId: args.collectionId,
        number: args.number,
        rarity: args.rarity,
        imageUrl: PLACEHOLDER,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  if (args.owned) {
    await UserCollectionModel.findOneAndUpdate(
      { pogId: pog._id },
      { $set: { pogId: pog._id, owned: true, condition: "good" } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  return pog;
}

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Chýba MONGODB_URI");

  await mongoose.connect(uri);
  console.log("Pripojené k databáze.");

  // --- Toy Story Panini Caps (slammery 1–8 + capy 9–78) ---
  const toyStory = await upsertCollection({
    name: "Toy Story Panini Caps",
    slug: "toy-story-panini-caps",
    description:
      "Disney/Pixar Toy Story — Panini Caps (1996). Slammery #1–#8 a capy #9–#78.",
    year: 1996,
    manufacturer: "Panini",
    totalItems: 78,
  });

  let owned = 0;
  for (let n = 1; n <= 78; n++) {
    const isSlammer = n <= 8;
    const name = isSlammer
      ? `Toy Story Slammer #${n}`
      : `Toy Story Cap #${n}`;
    // Slammery nie sú na fotke → chýbajú. Capy podľa OWNED_CAPS.
    const isOwned = !isSlammer && OWNED_CAPS.has(n);
    if (isOwned) owned++;
    await upsertPog({
      collectionId: toyStory._id,
      name,
      number: n,
      rarity: isSlammer ? "rare" : "common",
      owned: isOwned,
    });
  }
  console.log(
    `Toy Story Panini Caps: 78 capov (vlastnených ${owned}, chýba ${78 - owned}).`
  );

  console.log("Hotovo! ✅");
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
