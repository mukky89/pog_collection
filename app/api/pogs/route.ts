import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import PogModel from "@/lib/models/Pog";
import { getPogs, type PogQueryOptions } from "@/lib/queries";

export const dynamic = "force-dynamic";

// GET /api/pogs — všetky POG, search + filter + sort
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const opts: PogQueryOptions = {
      search: sp.get("search") || undefined,
      collectionId: sp.get("collectionId") || undefined,
      rarity: sp.get("rarity") || undefined,
      owned: (sp.get("owned") as "owned" | "missing") || undefined,
      minPrice: sp.get("minPrice") ? Number(sp.get("minPrice")) : undefined,
      maxPrice: sp.get("maxPrice") ? Number(sp.get("maxPrice")) : undefined,
      sort: (sp.get("sort") as PogQueryOptions["sort"]) || undefined,
    };
    const pogs = await getPogs(opts);
    return NextResponse.json(pogs);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/pogs — pridaj nový POG predmet
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    if (!body.name || !body.collectionId) {
      return NextResponse.json(
        { error: "Polia 'name' a 'collectionId' sú povinné" },
        { status: 400 }
      );
    }
    const created = await PogModel.create(body);
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
