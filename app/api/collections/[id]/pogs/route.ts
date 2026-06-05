import { NextRequest, NextResponse } from "next/server";
import { getPogsForCollection } from "@/lib/queries";

export const dynamic = "force-dynamic";

// GET /api/collections/[id]/pogs — POG predmety v kolekcii
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const pogs = await getPogsForCollection(params.id);
    return NextResponse.json(pogs);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
