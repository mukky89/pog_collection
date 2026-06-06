/**
 * Vyčistí stav vlastníctva — všetko označí ako **„nemám"**, okrem kolekcií,
 * ktoré chceme ponechať (predvolene „Toy Story Panini Caps", ktorú sme
 * potvrdili z fotky).
 *
 * Slúži na nastavenie čistého základu: ostatné capy v systéme (napr. náhodne
 * označené pôvodným `npm run seed`) prestanú byť vlastnené a vlastníctvo sa
 * bude dopĺňať postupne podľa reálnych fotiek zbierky.
 *
 * „Nemám" = žiadny záznam vlastníctva (rovnaká sémantika ako DELETE
 * /api/owned/[pogId]). Skript je idempotentný — dá sa spúšťať opakovane.
 *
 * Spustenie:  npm run reset-ownership
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

/** Slugy kolekcií, ktorých vlastníctvo sa NEMAŽE (potvrdené z fotiek). */
const KEEP_SLUGS = ["toy-story-panini-caps"];

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Chýba MONGODB_URI");

  await mongoose.connect(uri);
  console.log("Pripojené k databáze.");

  // ID capov v ponechaných kolekciách.
  const keepCollections = await CollectionModel.find({
    slug: { $in: KEEP_SLUGS },
  })
    .select("_id")
    .lean();
  const keepCollectionIds = keepCollections.map((c: any) => c._id);

  const keepPogs = await PogModel.find({
    collectionId: { $in: keepCollectionIds },
  })
    .select("_id")
    .lean();
  const keepPogIds = keepPogs.map((p: any) => p._id);

  // Zmaž vlastníctvo všetkého, čo nepatrí do ponechaných kolekcií.
  const res = await UserCollectionModel.deleteMany({
    pogId: { $nin: keepPogIds },
  });

  console.log(
    `Označené ako „nemám": zmazaných ${res.deletedCount} záznamov vlastníctva ` +
      `(ponechané kolekcie: ${KEEP_SLUGS.join(", ") || "žiadne"}).`
  );

  console.log("Hotovo! ✅");
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
