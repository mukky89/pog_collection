/**
 * Vygeneruje **zadné strany** Toy Story Panini capov — pre každý cap jednu
 * s jeho vlastným číslom.
 *
 * milkcapmania má naskenovaný len jeden exemplár zadku (generický dizajn
 * „Disney Toy Story / Panini Caps" s vytlačeným číslom 43). Reálne sa však
 * zadné strany líšia práve **číslom capu**, preto z tejto šablóny vyrobíme
 * pre každé číslo samostatný obrázok: pôvodné číslo prebijeme a vykreslíme
 * správne.
 *
 * Vstup:  public/pogs/toy-story-panini-caps/Back.png  (stiahnutý cez scrape)
 * Výstup: public/pogs/toy-story-panini-caps/<n>-back.png  pre n = 9..78
 *
 * Spustenie:  npm run backs:toy-story
 */
import sharp from "sharp";
import { join } from "node:path";

const DIR = join(process.cwd(), "public", "pogs", "toy-story-panini-caps");
const TEMPLATE = join(DIR, "Back.png");
const SIZE = 320; // rovnaká veľkosť ako ostatné obrázky setu
const FIRST = 9;
const LAST = 78;

/** SVG vrstva: biely obdĺžnik cez pôvodné číslo + nové číslo capu. */
function numberOverlay(n: number): Buffer {
  // Poloha čísla na 320px šablóne (hore v strede).
  const boxX = 105;
  const boxY = 14;
  const boxW = 110;
  const boxH = 58;
  const cx = boxX + boxW / 2;
  const baseline = boxY + 48;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
  <rect x="${boxX}" y="${boxY}" width="${boxW}" height="${boxH}" fill="#ffffff"/>
  <text x="${cx}" y="${baseline}" text-anchor="middle"
        font-family="DejaVu Sans, Arial, Helvetica, sans-serif"
        font-size="46" font-weight="bold" fill="#111111">${n}</text>
</svg>`;
  return Buffer.from(svg);
}

async function run() {
  // Over, že šablóna existuje a má očakávanú veľkosť.
  const base = sharp(TEMPLATE).resize(SIZE, SIZE, { fit: "inside" });
  const baseBuf = await base.png().toBuffer();

  let count = 0;
  for (let n = FIRST; n <= LAST; n++) {
    const out = await sharp(baseBuf)
      .composite([{ input: numberOverlay(n), top: 0, left: 0 }])
      .png({ compressionLevel: 9, palette: true })
      .toBuffer();
    await sharp(out).toFile(join(DIR, `${n}-back.png`));
    count++;
  }
  console.log(`Vygenerovaných ${count} zadných strán (#${FIRST}–#${LAST}).`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
