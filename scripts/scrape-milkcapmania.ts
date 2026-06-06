/**
 * Scraper pre milkcapmania.co.uk — stiahne reálne POG / milkcap vizuály
 * vybraných setov do `public/pogs/<slug>/` a vygeneruje manifest
 * `scripts/milkcapmania-data.json`, ktorý potom použije `npm run seed`.
 *
 * Sťahujeme 300 DPI verzie (ostré, ~425×425 px). Názvy súborov sú rovnaké
 * ako pri 75 DPI, takže re-scrape len nahradí obrázky bez zmeny ciest v DB.
 *
 * Spustenie:  npm run scrape
 *
 * Zdroj obrázkov: https://www.milkcapmania.co.uk (fanúšikovský katalóg).
 * Rešpektujeme `Crawl-delay: 3` z robots.txt — medzi načítaním HTML stránok
 * setov čakáme 3 s, medzi sťahovaním jednotlivých obrázkov krátku pauzu.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

// Cieľová veľkosť obrázka — 300DPI originály (~425–500 px) zmenšíme a
// skomprimujeme, aby bola karta ostrá, ale repo nenarástlo do stoviek MB.
const MAX_PX = 320;

const BASE = "https://www.milkcapmania.co.uk";
const UA =
  "pog-collector-scraper/1.0 (personal collection app; +https://github.com/mukky89/pog_collection)";

/** Konfigurácia setov, ktoré stiahneme. `path` je cesta na milkcapmania. */
type SetConfig = {
  path: string;
  slug: string;
  name: string;
  year: number;
  manufacturer: string;
};

const SETS: SetConfig[] = [
  {
    path: "/Panini-Caps/493-Toy-Story.html",
    slug: "toy-story-panini-caps",
    name: "Toy Story Panini Caps",
    year: 1996,
    manufacturer: "Panini",
  },
  {
    path: "/250-Brilliant-Frogs-Limited-Edition-Series-1.html",
    slug: "brilliant-frogs-series-1",
    name: "Brilliant Frogs Limited Edition Series 1",
    year: 1994,
    manufacturer: "Canada Games",
  },
  {
    path: "/1100-Pokémon-small.html",
    slug: "pokemon-small",
    name: "Pokémon (small)",
    year: 1999,
    manufacturer: "Various",
  },
  {
    path: "/808-Players-Biscuits-Power-Rangers.html",
    slug: "players-biscuits-power-rangers",
    name: "Players Biscuits Power Rangers",
    year: 1995,
    manufacturer: "Players Biscuits",
  },
  {
    path: "/263-Congo-Series-A.html",
    slug: "congo-series-a",
    name: "Congo Series A",
    year: 1995,
    manufacturer: "World POG Federation",
  },
  {
    path: "/1052-Dragonball-Z-Slammers.html",
    slug: "dragonball-z-slammers",
    name: "Dragonball Z Slammers",
    year: 1998,
    manufacturer: "Various",
  },
];

type PogEntry = { number: number; name: string; image: string };
type CollectionEntry = SetConfig & { source: string; pogs: PogEntry[] };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} pri ${url}`);
  return res.text();
}

/** Vytiahne všetky <img> tagy ako { src, alt }. */
function extractImages(html: string): { src: string; alt: string }[] {
  const out: { src: string; alt: string }[] = [];
  const re = /<img\b[^>]*?\bsrc="([^"]+)"[^>]*?(?:\balt="([^"]*)")?[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) out.push({ src: m[1], alt: m[2] ?? "" });
  return out;
}

/** Bezpečný názov súboru z URL cesty (zachová príponu). */
function safeFileName(src: string): string {
  const raw = decodeURIComponent(src.split("/").pop() || "image.png");
  return raw.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

/** Z názvu súboru odvodí poradové číslo a čisté meno capu. */
function parseFromFile(file: string): { number: number; name: string } {
  const stem = file.replace(/\.[a-z0-9]+$/i, "");
  const numMatch = stem.match(/^(\d+)/);
  const number = numMatch ? parseInt(numMatch[1], 10) : 0;
  const name = stem
    .replace(/^\d+\s*[-_]?\s*/, "")
    .replace(/[-_]+/g, " ")
    .trim();
  return { number, name: name || stem };
}

async function scrapeSet(cfg: SetConfig): Promise<CollectionEntry> {
  const source = BASE + cfg.path;
  console.log(`\n▶ ${cfg.name}\n  ${source}`);
  const html = await fetchText(source);
  const imgs = extractImages(html);

  // Capy daného setu sú v jednom 75DPI priečinku — vyber ten s najviac obrázkami.
  // (V <img> sú len 75DPI náhľady; 300DPI verziu stiahneme cez prepis cesty.)
  const byDir = new Map<string, { src: string; alt: string }[]>();
  for (const img of imgs) {
    if (!/\/75DPI\//i.test(img.src)) continue;
    if (!/\/Img\//i.test(img.src)) continue;
    const dir = img.src.slice(0, img.src.lastIndexOf("/"));
    (byDir.get(dir) ?? byDir.set(dir, []).get(dir)!).push(img);
  }
  let best: { src: string; alt: string }[] = [];
  for (const list of byDir.values()) if (list.length > best.length) best = list;
  if (!best.length) throw new Error(`Žiadne capy nenájdené pre ${cfg.name}`);

  const outDir = join(process.cwd(), "public", "pogs", cfg.slug);
  await mkdir(outDir, { recursive: true });

  // Deduplikuj podľa src a zoraď podľa názvu súboru.
  const seen = new Set<string>();
  const unique = best
    .filter((i) => (seen.has(i.src) ? false : (seen.add(i.src), true)))
    .sort((a, b) => a.src.localeCompare(b.src, "en"));

  const pogs: PogEntry[] = [];
  for (const img of unique) {
    const file = safeFileName(img.src);
    // Uprednostni ostrú 300DPI verziu; ak chýba, použij 75DPI náhľad.
    const hiRes = img.src.replace(/\/75DPI\//i, "/300DPI/");
    let res = await fetch(hiRes, { headers: { "User-Agent": UA } });
    if (!res.ok) res = await fetch(img.src, { headers: { "User-Agent": UA } });
    if (!res.ok) {
      console.warn(`  ⚠ vynechané (${res.status}): ${img.src}`);
      continue;
    }
    const raw = Buffer.from(await res.arrayBuffer());
    const buf = await sharp(raw)
      .resize(MAX_PX, MAX_PX, { fit: "inside", withoutEnlargement: true })
      .png({ quality: 80, compressionLevel: 9, palette: true })
      .toBuffer();
    await writeFile(join(outDir, file), buf);

    const { number, name } = parseFromFile(file);
    // Uprednostni čitateľný názov z alt textu (bez prefixu setu a koncovej bodky).
    const altName = img.alt
      .replace(new RegExp(`^${cfg.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*`, "i"), "")
      .replace(/\.$/, "")
      .replace(/^\d+\s*[-_]?\s*/, "")
      .trim();
    pogs.push({
      number,
      name: altName || name,
      image: `/pogs/${cfg.slug}/${file}`,
    });
    await sleep(150);
  }

  pogs.sort((a, b) => a.number - b.number || a.name.localeCompare(b.name));
  console.log(`  ✔ stiahnutých ${pogs.length} capov`);
  return { ...cfg, source, pogs };
}

async function run() {
  const collections: CollectionEntry[] = [];
  for (const [i, cfg] of SETS.entries()) {
    if (i > 0) await sleep(3000); // rešpektuj Crawl-delay: 3
    try {
      collections.push(await scrapeSet(cfg));
    } catch (e: any) {
      console.error(`  ✖ ${cfg.name}: ${e.message}`);
    }
  }

  const manifest = {
    source: "https://www.milkcapmania.co.uk",
    scrapedAt: new Date().toISOString().slice(0, 10),
    collections,
  };
  const outFile = join(process.cwd(), "scripts", "milkcapmania-data.json");
  await writeFile(outFile, JSON.stringify(manifest, null, 2) + "\n");
  const total = collections.reduce((s, c) => s + c.pogs.length, 0);
  console.log(
    `\n✅ Hotovo: ${collections.length} kolekcií, ${total} capov.\n   Manifest: ${outFile}`
  );
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
