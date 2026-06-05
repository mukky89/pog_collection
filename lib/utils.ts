import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
  common: "bg-slate-100 text-slate-700 border-slate-200",
  uncommon: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rare: "bg-blue-100 text-blue-700 border-blue-200",
  "ultra-rare": "bg-purple-100 text-purple-700 border-purple-200",
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
