/**
 * Seed skript — naplní databázu ukážkovými kolekciami a POG predmetmi.
 * Spustenie:  npm run seed
 */
import "dotenv/config";
import mongoose from "mongoose";
import CollectionModel from "../lib/models/Collection";
import PogModel from "../lib/models/Pog";
import UserCollectionModel from "../lib/models/UserCollection";
import { slugify } from "../lib/utils";

const RARITIES = ["common", "uncommon", "rare", "ultra-rare"] as const;

const COLLECTIONS = [
  {
    name: "World POG Federation",
    description: "Originálna séria POG the Game od World POG Federation.",
    year: 1994,
    manufacturer: "World POG Federation",
    count: 12,
  },
  {
    name: "Mighty Morphin Power Rangers",
    description: "Limitovaná séria s motívmi Power Rangers.",
    year: 1995,
    manufacturer: "Saban",
    count: 8,
  },
  {
    name: "Slammer Whammers",
    description: "Kovové slammery a špeciálne edície.",
    year: 1993,
    manufacturer: "Spectra Star",
    count: 10,
  },
];

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Chýba MONGODB_URI");
  await mongoose.connect(uri);
  console.log("Pripojené k databáze.");

  await Promise.all([
    CollectionModel.deleteMany({}),
    PogModel.deleteMany({}),
    UserCollectionModel.deleteMany({}),
  ]);
  console.log("Databáza vyčistená.");

  for (const c of COLLECTIONS) {
    const collection = await CollectionModel.create({
      name: c.name,
      slug: slugify(c.name),
      description: c.description,
      year: c.year,
      manufacturer: c.manufacturer,
      totalItems: c.count,
    });

    const pogs = [];
    for (let i = 1; i <= c.count; i++) {
      const rarity = RARITIES[Math.floor(Math.random() * RARITIES.length)];
      const basePrice =
        rarity === "ultra-rare"
          ? 2000
          : rarity === "rare"
            ? 800
            : rarity === "uncommon"
              ? 300
              : 50;
      pogs.push({
        name: `${c.name} #${i}`,
        collectionId: collection._id,
        number: i,
        rarity,
        price: basePrice + Math.floor(Math.random() * basePrice),
        description: `POG číslo ${i} zo série ${c.name}.`,
        tags: [c.manufacturer.toLowerCase().replace(/\s+/g, "-")],
      });
    }
    const created = await PogModel.insertMany(pogs);
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
