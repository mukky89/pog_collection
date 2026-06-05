import { NextRequest } from "next/server";
import { generatePogSkinSvg } from "@/lib/skin";

// GET /api/skin?seed=...&rarity=... — vygeneruje milkcap SVG skin
export function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const seed = sp.get("seed") || "pog";
  const rarity = sp.get("rarity") || "common";

  const svg = generatePogSkinSvg(seed, rarity);

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
