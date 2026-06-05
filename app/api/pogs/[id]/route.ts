import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import PogModel from "@/lib/models/Pog";
import UserCollectionModel from "@/lib/models/UserCollection";
import { getPogById } from "@/lib/queries";

export const dynamic = "force-dynamic";

interface Params {
  params: { id: string };
}

// GET /api/pogs/[id] — detail POG
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const pog = await getPogById(params.id);
    if (!pog) {
      return NextResponse.json({ error: "POG neexistuje" }, { status: 404 });
    }
    return NextResponse.json(pog);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PUT /api/pogs/[id] — edituj POG (cena, info)
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const body = await req.json();
    const updated = await PogModel.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return NextResponse.json({ error: "POG neexistuje" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE /api/pogs/[id] — zmaž POG predmet aj jeho záznam vlastníctva
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const deleted = await PogModel.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ error: "POG neexistuje" }, { status: 404 });
    }
    await UserCollectionModel.deleteOne({ pogId: params.id });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
