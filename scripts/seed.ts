/**
 * Seed skript — naplní databázu reálnymi POG / milkcap kolekciami
 * stiahnutými z milkcapmania.co.uk (manifest `milkcapmania-data.json`).
 *
 * Ak manifest chýba, najprv spusti:  npm run scrape
 * Spustenie seedu:                   npm run seed
 */
import mongoose from "mongoose";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Lokálne načítaj .env.local cez dotenv (ak je nainštalovaný). Na Railway
// sú premenné injektnuté priamo do prostredia, takže dotenv nie je potrebný.
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { config } = require("dotenv");
  config({ path: ".env.local" });
  config();
} catch {
  /* dotenv nie je dostupný (napr. produkcia) — použijeme process.env */
}

import CollectionModel from "../lib/models/Collection";
import PogModel from "../lib/models/Pog";
import UserCollectionModel from "../lib/models/UserCollection";
import { slugify } from "../lib/utils";

type ManifestPog = { number: number; name: string; image: string };
type ManifestCollection = {
  slug: string;
  name: string;
  year: number;
  manufacturer: string;
  source: string;
  pogs: ManifestPog[];
};
type Manifest = {
  source: string;
  scrapedAt: string;
  collections: ManifestCollection[];
};

function loadManifest(): Manifest {
  const file = join(process.cwd(), "scripts", "milkcapmania-data.json");
  try {
    return JSON.parse(readFileSync(file, "utf-8"));
  } catch {
    throw new Error(
      `Chýba manifest ${file}. Najprv spusti: npm run scrape`
    );
  }
}

/** Deterministická vzácnosť podľa poradového čísla — dáva kolekcii pestrosť. */
function rarityFor(n: number): "common" | "uncommon" | "rare" | "ultra-rare" {
  if (n > 0 && n % 13 === 0) return "ultra-rare";
  if (n > 0 && n % 7 === 0) return "rare";
  if (n % 3 === 0) return "uncommon";
  return "common";
}

function priceFor(rarity: string): number {
  const base =
    rarity === "ultra-rare"
      ? 2000
      : rarity === "rare"
        ? 800
        : rarity === "uncommon"
          ? 300
          : 50;
  return base + Math.floor(Math.random() * base); // v centoch
}

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Chýba MONGODB_URI");

  const manifest = loadManifest();

  await mongoose.connect(uri);
  console.log("Pripojené k databáze.");

  await Promise.all([
    CollectionModel.deleteMany({}),
    PogModel.deleteMany({}),
    UserCollectionModel.deleteMany({}),
  ]);
  console.log("Databáza vyčistená.");

  for (const c of manifest.collections) {
    // Vynechaj katalógové "Back" dizajny (zadné strany capov).
    const fronts = c.pogs.filter((p) => !/^back\b/i.test(p.name.trim()));
    if (!fronts.length) continue;

    const collection = await CollectionModel.create({
      name: c.name,
      slug: slugify(c.name) || c.slug,
      description: `${c.name} — vizuály z katalógu milkcapmania.co.uk.`,
      year: c.year,
      manufacturer: c.manufacturer,
      coverImage: fronts[0].image,
      totalItems: fronts.length,
    });

    const docs = fronts.map((p, idx) => {
      const number = p.number > 0 ? p.number : idx + 1;
      const rarity = rarityFor(number);
      return {
        name: p.name,
        collectionId: collection._id,
        number,
        rarity,
        price: priceFor(rarity),
        imageUrl: p.image,
        description: `${p.name} zo série ${c.name}.`,
        tags: [c.manufacturer.toLowerCase().replace(/\s+/g, "-")].filter(
          Boolean
        ),
      };
    });

    const created = await PogModel.insertMany(docs);
    console.log(`Vytvorená kolekcia "${c.name}" s ${created.length} POG-mi.`);

    // Označ náhodnú časť ako vlastnené
    for (const pog of created) {
      if (Math.random() < 0.4) {
        await UserCollectionModel.create({
          pogId: pog._id,
          owned: true,
          condition: ["mint", "good", "fair"][Math.floor(Math.random() * 3)],
        });
      }
    }
  }

  console.log("Hotovo! ✅");
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
