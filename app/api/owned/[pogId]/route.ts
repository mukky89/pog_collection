import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import UserCollectionModel from "@/lib/models/UserCollection";

export const dynamic = "force-dynamic";

interface Params {
  params: { pogId: string };
}

// POST /api/owned/[pogId] — označ POG ako vlastnený
export async function POST(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // bez tela requestu — len označiť ako vlastnený
    }
    const record = await UserCollectionModel.findOneAndUpdate(
      { pogId: params.pogId },
      { $set: { owned: true, ...body, pogId: params.pogId } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return NextResponse.json(record, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PUT /api/owned/[pogId] — uprav detaily (podmienka, cena, poznámky)
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const body = await req.json();
    const record = await UserCollectionModel.findOneAndUpdate(
      { pogId: params.pogId },
      { $set: { ...body, pogId: params.pogId } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return NextResponse.json(record);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE /api/owned/[pogId] — odznač POG ako vlastnený
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    await UserCollectionModel.deleteOne({ pogId: params.pogId });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
