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
 * Reálne obrázky a názvy capov sa berú z manifestu `milkcapmania-data.json`
 * (vytvorený cez `npm run scrape`). Slammery #1–#8 na stránke nie sú, takže
 * dostanú placeholder. Vlastnené kusy sú prečítané z fotky zbierky
 * (`OWNED_COUNTS`, vrátane počtu kusov/duplikátov); slammery na fotke nie sú,
 * takže ostávajú ako chýbajúce.
 *
 * Spustenie:  npm run seed:toy-story  (najprv `npm run scrape`)
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

const SLUG = "toy-story-panini-caps";
const PLACEHOLDER = "/placeholder-pog.svg";

/**
 * Capy, ktoré reálne vlastním a koľko KUSOV (prečítané z fotky zbierky —
 * fotka môže obsahovať duplikáty). Číslo = počet kusov daného capu.
 * Capy neuvedené tu = nemám (0 kusov).
 */
const OWNED_COUNTS: Record<number, number> = {
  9: 1, 15: 1, 17: 2, 21: 2, 22: 1, 23: 1, 29: 1, 30: 1, 31: 1, 33: 1,
  34: 2, 35: 2, 36: 2, 37: 1, 38: 2, 39: 1, 40: 2, 41: 1, 42: 1, 43: 2,
  44: 1, 50: 1, 51: 1, 54: 2, 55: 2, 56: 2, 58: 1, 59: 1, 60: 1, 62: 1,
  63: 1, 66: 1, 68: 1, 69: 1, 70: 1, 72: 1, 73: 3, 74: 1, 75: 1, 76: 2,
  77: 1, 78: 2,
};

type Visual = { name: string; image: string };

/**
 * Z manifestu zostav mapu číslo capu -> { názov, predný obrázok } a zároveň
 * spoločnú **zadnú stranu** capu (katalógový „Back" dizajn).
 */
function loadVisuals(): { fronts: Map<number, Visual>; back?: string } {
  const fronts = new Map<number, Visual>();
  let back: string | undefined;
  const isBack = (p: any) =>
    p.number === 0 || /^back\b/i.test(String(p.name).trim());
  try {
    const file = join(process.cwd(), "scripts", "milkcapmania-data.json");
    const manifest = JSON.parse(readFileSync(file, "utf-8"));
    const coll = manifest.collections?.find((c: any) => c.slug === SLUG);
    for (const p of coll?.pogs ?? []) {
      if (isBack(p)) {
        back = back ?? p.image; // spoločná zadná strana pre celý set
      } else if (!fronts.has(p.number)) {
        // neprepisuj už uloženú variantu (niektoré čísla majú viac dizajnov)
        fronts.set(p.number, { name: p.name, image: p.image });
      }
    }
  } catch {
    console.warn(
      "⚠ Manifest milkcapmania-data.json sa nenašiel — použijem placeholder. " +
        "Spusti najprv: npm run scrape"
    );
  }
  return { fronts, back };
}

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
  imageUrl: string;
  imageBackUrl?: string;
  quantity: number; // počet kusov; 0 = nemám
}) {
  const pog = await PogModel.findOneAndUpdate(
    { collectionId: args.collectionId, number: args.number },
    {
      $set: {
        name: args.name,
        collectionId: args.collectionId,
        number: args.number,
        rarity: args.rarity,
        imageUrl: args.imageUrl,
        imageBackUrl: args.imageBackUrl,
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

  const { fronts, back } = loadVisuals();

  await mongoose.connect(uri);
  console.log("Pripojené k databáze.");

  // Obal kolekcie = prvý reálny obrázok capu (fallback placeholder).
  const cover = fronts.get(9)?.image ?? fronts.values().next().value?.image;

  const toyStory = await upsertCollection({
    name: "Toy Story Panini Caps",
    slug: SLUG,
    description:
      "Disney/Pixar Toy Story — Panini Caps (1996). Slammery #1–#8 a capy #9–#78.",
    year: 1996,
    manufacturer: "Panini",
    totalItems: 78,
    coverImage: cover,
  });

  let owned = 0;
  let withImage = 0;
  let pieces = 0;
  for (let n = 1; n <= 78; n++) {
    const isSlammer = n <= 8;
    const visual = fronts.get(n);
    if (visual) withImage++;
    const name =
      visual?.name ||
      (isSlammer ? `Toy Story Slammer #${n}` : `Toy Story Cap #${n}`);
    // Slammery nie sú na fotke → 0 kusov. Capy podľa OWNED_COUNTS (vrátane
    // duplikátov).
    const quantity = isSlammer ? 0 : OWNED_COUNTS[n] ?? 0;
    if (quantity > 0) owned++;
    pieces += quantity;
    await upsertPog({
      collectionId: toyStory._id,
      name,
      number: n,
      rarity: isSlammer ? "rare" : "common",
      imageUrl: visual?.image ?? PLACEHOLDER,
      // Originálna zadná strana zo stránky (spoločná pre set, nie generovaná).
      imageBackUrl: back ?? PLACEHOLDER,
      quantity,
    });
  }
  console.log(
    `Toy Story Panini Caps: 78 capov (s obrázkom ${withImage}, ` +
      `vlastnených ${owned} (${pieces} ks vrátane duplikátov), ` +
      `chýba ${78 - owned}).`
  );

  console.log("Hotovo! ✅");
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
