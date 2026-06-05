import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DICEBEAR = "https://api.dicebear.com/9.x";
const PLACEHOLDER = "/placeholder-pog.svg";

/** Farebné palety pozadia milkcap skinu podľa vzácnosti (DiceBear). */
const SKIN_PALETTES: Record<string, string> = {
  common: "cbd5e1,e2e8f0,94a3b8",
  uncommon: "a7f3d0,6ee7b7,34d399",
  rare: "93c5fd,60a5fa,3b82f6",
  "ultra-rare": "f0abfc,e879f9,c084fc,a78bfa",
};

/**
 * Vygeneruje URL na originálny „milkcap" skin POG-u cez DiceBear (štýl rings).
 * Seed zaručuje, že rovnaký POG má vždy rovnaký skin.
 */
export function pogSkinUrl(
  seed: string,
  rarity: string = "common",
  variant: string = ""
): string {
  const bg = SKIN_PALETTES[rarity] ?? SKIN_PALETTES.common;
  const params = new URLSearchParams({
    seed: variant ? `${seed}#${variant}` : seed,
    backgroundColor: bg,
    backgroundType: rarity === "ultra-rare" ? "gradientLinear" : "solid",
    radius: "50",
  });
  return `${DICEBEAR}/rings/svg?${params.toString()}`;
}

/** Skin pre obal kolekcie (farebné geometrické tvary). */
export function collectionCoverUrl(seed: string): string {
  const params = new URLSearchParams({
    seed,
    backgroundType: "gradientLinear",
  });
  return `${DICEBEAR}/shapes/svg?${params.toString()}`;
}

/** Vráti reálny obrázok POG-u, alebo vygenerovaný skin ak žiadny nie je. */
export function pogImageSrc(pog: {
  imageUrl?: string;
  name?: string;
  number?: number;
  rarity?: string;
}): string {
  const url = pog.imageUrl?.trim();
  if (url && url !== PLACEHOLDER && !url.endsWith("placeholder-pog.svg")) {
    return url;
  }
  return pogSkinUrl(`${pog.name ?? "pog"}-${pog.number ?? 0}`, pog.rarity);
}

/** Vráti obal kolekcie, alebo vygenerovaný skin ak žiadny nie je. */
export function collectionImageSrc(collection: {
  coverImage?: string;
  name?: string;
  slug?: string;
}): string {
  const url = collection.coverImage?.trim();
  if (url && url !== PLACEHOLDER && !url.endsWith("placeholder-pog.svg")) {
    return url;
  }
  return collectionCoverUrl(collection.slug || collection.name || "collection");
}

/** Naformátuje cenu uloženú v centoch na €, napr. 150 -> "1,50 €" */
export function formatPrice(cents: number | undefined | null): string {
  const value = (cents ?? 0) / 100;
  return new Intl.NumberFormat("sk-SK", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

/** Prevedie zadané € (string/number) na celé centy. */
export function eurosToCents(euros: string | number): number {
  const n = typeof euros === "string" ? parseFloat(euros.replace(",", ".")) : euros;
  if (Number.isNaN(n)) return 0;
  return Math.round(n * 100);
}

/** Vytvorí URL-friendly slug z reťazca. */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export const RARITY_LABELS: Record<string, string> = {
  common: "Bežný",
  uncommon: "Menej bežný",
  rare: "Vzácny",
  "ultra-rare": "Ultra vzácny",
};

export const RARITY_ORDER: Record<string, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  "ultra-rare": 3,
};

export const RARITY_STYLES: Record<string, string> = {
  common: "bg-slate-100 text-slate-700 border-slate-300",
  uncommon: "bg-emerald-100 text-emerald-700 border-emerald-400",
  rare: "bg-sky-100 text-sky-700 border-sky-400",
  "ultra-rare":
    "bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white border-fuchsia-300",
};

/** Farebné prstence/žiara okolo POG-u podľa vzácnosti. */
export const RARITY_RING: Record<string, string> = {
  common: "ring-slate-200",
  uncommon: "ring-emerald-300",
  rare: "ring-sky-400",
  "ultra-rare": "ring-fuchsia-400 shadow-[0_0_24px_-2px] shadow-fuchsia-400/60",
};

export const CONDITION_LABELS: Record<string, string> = {
  mint: "Perfektný",
  good: "Dobrý",
  fair: "Priemerný",
  poor: "Slabý",
};

/** Bezpečne serializuje Mongoose dokument na plain JSON. */
export function serialize<T>(doc: unknown): T {
  return JSON.parse(JSON.stringify(doc)) as T;
}
