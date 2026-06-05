/**
 * Deterministický generátor "milkcap" POG skinov ako inline SVG.
 * Bez externých závislostí — rovnaký seed vždy vyprodukuje rovnaký skin.
 */

function hashSeed(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h ^ (h >>> 16)) >>> 0;
}

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PALETTES: Record<string, string[]> = {
  common: ["#94a3b8", "#cbd5e1", "#e2e8f0", "#64748b", "#f1f5f9"],
  uncommon: ["#34d399", "#6ee7b7", "#a7f3d0", "#10b981", "#ecfdf5"],
  rare: ["#3b82f6", "#60a5fa", "#93c5fd", "#2563eb", "#dbeafe"],
  "ultra-rare": ["#e879f9", "#c084fc", "#a78bfa", "#f0abfc", "#fae8ff"],
  cover: ["#ff2e93", "#00c2ff", "#ffd400", "#8b2fff", "#ff7a18", "#7cff3d"],
};

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

/**
 * Vygeneruje SVG reťazec milkcap POG-u.
 */
export function generatePogSkinSvg(
  seed: string,
  rarity: string = "common"
): string {
  const palette = PALETTES[rarity] ?? PALETTES.common;
  const rng = mulberry32(hashSeed(seed));

  const bg = pick(palette, rng);
  const ring1 = pick(palette, rng);
  const ring2 = pick(palette, rng);
  const burst = pick(palette, rng);
  const center = pick(palette, rng);
  const rot = Math.floor(rng() * 60);
  const spikes = 10 + Math.floor(rng() * 8);
  const dots = 6 + Math.floor(rng() * 8);

  // Starburst lúče
  let burstPaths = "";
  for (let i = 0; i < spikes; i++) {
    const a = (360 / spikes) * i;
    burstPaths += `<path d="M0,-92 L9,-72 L-9,-72 Z" transform="rotate(${a})"/>`;
  }

  // Bodky po obvode vnútorného kruhu
  let dotEls = "";
  for (let i = 0; i < dots; i++) {
    const a = ((360 / dots) * i * Math.PI) / 180;
    const x = Math.cos(a) * 40;
    const y = Math.sin(a) * 40;
    dotEls += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="${bg}"/>`;
  }

  // Hviezda v strede
  let star = "";
  const sp = 5;
  const pts: string[] = [];
  for (let i = 0; i < sp * 2; i++) {
    const r = i % 2 === 0 ? 20 : 9;
    const a = (Math.PI / sp) * i - Math.PI / 2;
    pts.push(`${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`);
  }
  star = `<polygon points="${pts.join(" ")}" fill="${bg}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
<rect width="200" height="200" fill="${bg}"/>
<g transform="translate(100 100)">
<circle r="100" fill="${ring1}"/>
<g fill="${burst}" transform="rotate(${rot})">${burstPaths}</g>
<circle r="70" fill="${bg}"/>
<circle r="70" fill="none" stroke="${ring2}" stroke-width="6"/>
<circle r="52" fill="${ring2}"/>
<g>${dotEls}</g>
<circle r="30" fill="${center}"/>
<circle r="30" fill="none" stroke="${bg}" stroke-width="3"/>
${star}
</g>
</svg>`;
}
