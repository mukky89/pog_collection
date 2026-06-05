import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import UserCollectionModel from "@/lib/models/UserCollection";
import PogModel from "@/lib/models/Pog";
import { serialize } from "@/lib/utils";

export const dynamic = "force-dynamic";

// GET /api/owned — všetky vlastnené POG (so záznamom vlastníctva)
export async function GET() {
  try {
    await dbConnect();
    // Zaisti registráciu Pog modelu pre populate
    void PogModel;
    const records = await UserCollectionModel.find({ owned: true })
      .populate({ path: "pogId", populate: { path: "collectionId", select: "name slug" } })
      .lean();
    return NextResponse.json(serialize(records));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
