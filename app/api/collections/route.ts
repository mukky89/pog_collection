import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import CollectionModel from "@/lib/models/Collection";
import { getCollectionsWithStats } from "@/lib/queries";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

// GET /api/collections — všetky kolekcie so štatistikami
export async function GET() {
  try {
    const collections = await getCollectionsWithStats();
    return NextResponse.json(collections);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/collections — vytvor novú kolekciu
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json(
        { error: "Pole 'name' je povinné" },
        { status: 400 }
      );
    }
    const slug = body.slug ? slugify(body.slug) : slugify(body.name);
    const created = await CollectionModel.create({ ...body, slug });
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
