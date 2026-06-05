import dbConnect from "@/lib/mongodb";
import CollectionModel from "@/lib/models/Collection";
import PogModel from "@/lib/models/Pog";
import UserCollectionModel from "@/lib/models/UserCollection";
import { serialize } from "@/lib/utils";
import type {
  Collection,
  CollectionWithStats,
  DashboardStats,
  Pog,
  PogWithOwnership,
  UserCollection,
} from "@/types";

/** Vráti množinu ID vlastnených POG-ov. */
async function getOwnedPogIdSet(): Promise<Set<string>> {
  const owned = await UserCollectionModel.find({ owned: true })
    .select("pogId")
    .lean();
  return new Set(owned.map((o: any) => String(o.pogId)));
}

/** Vráti mapu pogId -> záznam vlastníctva. */
async function getOwnershipMap(): Promise<Map<string, UserCollection>> {
  const records = await UserCollectionModel.find({}).lean();
  const map = new Map<string, UserCollection>();
  for (const r of records) {
    map.set(String((r as any).pogId), serialize<UserCollection>(r));
  }
  return map;
}

/** Všetky kolekcie obohatené o štatistiky (počet, kompletnosť, hodnota). */
export async function getCollectionsWithStats(): Promise<CollectionWithStats[]> {
  await dbConnect();
  const [collections, pogs, ownedSet] = await Promise.all([
    CollectionModel.find({}).sort({ year: 1, name: 1 }).lean(),
    PogModel.find({}).select("collectionId price").lean(),
    getOwnedPogIdSet(),
  ]);

  return collections.map((c: any) => {
    const collectionPogs = pogs.filter(
      (p: any) => String(p.collectionId) === String(c._id)
    );
    const pogCount = collectionPogs.length;
    const ownedPogs = collectionPogs.filter((p: any) =>
      ownedSet.has(String(p._id))
    );
    const ownedCount = ownedPogs.length;
    const totalValue = collectionPogs.reduce(
      (sum: number, p: any) => sum + (p.price || 0),
      0
    );
    const ownedValue = ownedPogs.reduce(
      (sum: number, p: any) => sum + (p.price || 0),
      0
    );
    const completeness =
      pogCount > 0 ? Math.round((ownedCount / pogCount) * 100) : 0;

    return {
      ...serialize<Collection>(c),
      pogCount,
      ownedCount,
      completeness,
      totalValue,
      ownedValue,
    };
  });
}

export async function getCollectionById(
  id: string
): Promise<CollectionWithStats | null> {
  const all = await getCollectionsWithStats();
  return all.find((c) => c._id === id || c.slug === id) ?? null;
}

/** POG-y v danej kolekcii spolu so stavom vlastníctva. */
export async function getPogsForCollection(
  collectionId: string
): Promise<PogWithOwnership[]> {
  await dbConnect();
  const [pogs, ownershipMap] = await Promise.all([
    PogModel.find({ collectionId }).sort({ number: 1 }).lean(),
    getOwnershipMap(),
  ]);
  return pogs.map((p: any) => attachOwnership(serialize<Pog>(p), ownershipMap));
}

function attachOwnership(
  pog: Pog,
  map: Map<string, UserCollection>
): PogWithOwnership {
  const ownership = map.get(pog._id) ?? null;
  return {
    ...pog,
    ownership,
    isOwned: ownership?.owned === true,
  };
}

export interface PogQueryOptions {
  search?: string;
  collectionId?: string;
  rarity?: string;
  owned?: "owned" | "missing";
  minPrice?: number; // v centoch
  maxPrice?: number; // v centoch
  sort?: "price" | "-price" | "name" | "number" | "rarity";
}

/** Všetky POG-y s podporou hľadania, filtrov a triedenia. */
export async function getPogs(
  opts: PogQueryOptions = {}
): Promise<PogWithOwnership[]> {
  await dbConnect();

  const query: Record<string, any> = {};
  if (opts.collectionId) query.collectionId = opts.collectionId;
  if (opts.rarity) query.rarity = opts.rarity;
  if (opts.search) query.name = { $regex: opts.search, $options: "i" };
  if (opts.minPrice != null || opts.maxPrice != null) {
    query.price = {};
    if (opts.minPrice != null) query.price.$gte = opts.minPrice;
    if (opts.maxPrice != null) query.price.$lte = opts.maxPrice;
  }

  const sortMap: Record<string, any> = {
    price: { price: 1 },
    "-price": { price: -1 },
    name: { name: 1 },
    number: { number: 1 },
    rarity: { rarity: 1 },
  };
  const sort = sortMap[opts.sort ?? "number"] ?? { number: 1 };

  const [pogs, ownershipMap] = await Promise.all([
    PogModel.find(query)
      .sort(sort)
      .populate("collectionId", "name slug")
      .lean(),
    getOwnershipMap(),
  ]);

  let result = pogs.map((p: any) =>
    attachOwnership(serialize<Pog>(p), ownershipMap)
  );

  if (opts.owned === "owned") result = result.filter((p) => p.isOwned);
  if (opts.owned === "missing") result = result.filter((p) => !p.isOwned);

  return result;
}

export async function getPogById(
  id: string
): Promise<PogWithOwnership | null> {
  await dbConnect();
  const pog = await PogModel.findById(id)
    .populate("collectionId", "name slug")
    .lean();
  if (!pog) return null;
  const ownershipMap = await getOwnershipMap();
  return attachOwnership(serialize<Pog>(pog), ownershipMap);
}

/** Podobné POG-y z rovnakej kolekcie. */
export async function getSimilarPogs(
  pog: PogWithOwnership,
  limit = 6
): Promise<PogWithOwnership[]> {
  await dbConnect();
  const collectionId =
    typeof pog.collectionId === "string"
      ? pog.collectionId
      : (pog.collectionId as any)?._id;
  if (!collectionId) return [];
  const [pogs, ownershipMap] = await Promise.all([
    PogModel.find({ collectionId, _id: { $ne: pog._id } })
      .sort({ number: 1 })
      .limit(limit)
      .lean(),
    getOwnershipMap(),
  ]);
  return pogs.map((p: any) => attachOwnership(serialize<Pog>(p), ownershipMap));
}

/** Dashboard štatistiky. */
export async function getDashboardStats(): Promise<DashboardStats> {
  await dbConnect();
  const [pogs, ownedSet, collectionCount] = await Promise.all([
    PogModel.find({}).select("price name rarity number imageUrl").lean(),
    getOwnedPogIdSet(),
    CollectionModel.countDocuments({}),
  ]);

  const totalPogs = pogs.length;
  let totalValue = 0;
  let catalogValue = 0;
  let ownedCount = 0;

  for (const p of pogs as any[]) {
    catalogValue += p.price || 0;
    if (ownedSet.has(String(p._id))) {
      ownedCount += 1;
      totalValue += p.price || 0;
    }
  }

  const missingCount = totalPogs - ownedCount;
  const missingValue = catalogValue - totalValue;
  const completeness =
    totalPogs > 0 ? Math.round((ownedCount / totalPogs) * 100) : 0;

  const rarest = (pogs as any[])
    .slice()
    .sort((a, b) => (b.price || 0) - (a.price || 0))
    .slice(0, 5)
    .map((p) => serialize<Pog>(p));

  return {
    totalValue,
    missingValue,
    catalogValue,
    ownedCount,
    totalPogs,
    missingCount,
    completeness,
    collectionCount,
    rarest,
  };
}

export async function getAllCollectionsPlain(): Promise<Collection[]> {
  await dbConnect();
  const collections = await CollectionModel.find({})
    .sort({ year: 1, name: 1 })
    .lean();
  return collections.map((c: any) => serialize<Collection>(c));
}
