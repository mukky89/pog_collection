import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import CollectionModel from "@/lib/models/Collection";
import PogModel from "@/lib/models/Pog";
import { getCollectionById } from "@/lib/queries";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Params {
  params: { id: string };
}

// GET /api/collections/[id] — detail kolekcie so štatistikami
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const collection = await getCollectionById(params.id);
    if (!collection) {
      return NextResponse.json(
        { error: "Kolekcia neexistuje" },
        { status: 404 }
      );
    }
    return NextResponse.json(collection);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PUT /api/collections/[id] — edituj kolekciu
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const body = await req.json();
    if (body.name && !body.slug) body.slug = slugify(body.name);
    if (body.slug) body.slug = slugify(body.slug);
    const updated = await CollectionModel.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return NextResponse.json(
        { error: "Kolekcia neexistuje" },
        { status: 404 }
      );
    }
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE /api/collections/[id] — zmaž kolekciu aj jej POG-y
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const deleted = await CollectionModel.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Kolekcia neexistuje" },
        { status: 404 }
      );
    }
    await PogModel.deleteMany({ collectionId: params.id });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
