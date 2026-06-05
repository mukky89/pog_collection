import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import dbConnect from "@/lib/mongodb";
import CollectionModel from "@/lib/models/Collection";
import PogModel from "@/lib/models/Pog";
import { eurosToCents, slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * POST /api/import — hromadný import POG-ov cez CSV.
 *
 * Akceptuje buď `multipart/form-data` so súborom v poli `file`,
 * alebo JSON `{ csv: "..." }`.
 *
 * Očakávané stĺpce: name, collection, number, rarity, price (€),
 * imageUrl, imageBackUrl, description, tags (oddelené `;`)
 */
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    let csvText = "";
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      if (file && file instanceof Blob) {
        csvText = await file.text();
      }
    } else {
      const body = await req.json();
      csvText = body.csv ?? "";
    }

    if (!csvText.trim()) {
      return NextResponse.json(
        { error: "Chýba CSV obsah" },
        { status: 400 }
      );
    }

    const parsed = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
    });

    if (parsed.errors.length) {
      return NextResponse.json(
        { error: "Chyba pri parsovaní CSV", details: parsed.errors },
        { status: 400 }
      );
    }

    // Cache kolekcií, aby sme nerobili duplicitné lookupy
    const collectionCache = new Map<string, any>();
    let imported = 0;
    let createdCollections = 0;
    const errors: string[] = [];

    for (const [i, row] of parsed.data.entries()) {
      try {
        const name = row.name?.trim();
        const collName = row.collection?.trim();
        if (!name || !collName) {
          errors.push(`Riadok ${i + 2}: chýba 'name' alebo 'collection'`);
          continue;
        }

        const slug = slugify(collName);
        let collection = collectionCache.get(slug);
        if (!collection) {
          collection = await CollectionModel.findOne({ slug });
          if (!collection) {
            collection = await CollectionModel.create({
              name: collName,
              slug,
              year: row.year ? Number(row.year) : new Date().getFullYear(),
              manufacturer: row.manufacturer?.trim() || "",
            });
            createdCollections += 1;
          }
          collectionCache.set(slug, collection);
        }

        const rarity = (row.rarity?.trim() || "common") as string;
        const validRarities = ["common", "uncommon", "rare", "ultra-rare"];

        await PogModel.create({
          name,
          collectionId: collection._id,
          number: row.number ? Number(row.number) : 0,
          rarity: validRarities.includes(rarity) ? rarity : "common",
          price: row.price ? eurosToCents(row.price) : 0,
          imageUrl: row.imageurl?.trim() || "/placeholder-pog.svg",
          imageBackUrl: row.imagebackurl?.trim() || undefined,
          description: row.description?.trim() || undefined,
          tags: row.tags
            ? row.tags.split(";").map((t) => t.trim()).filter(Boolean)
            : [],
        });
        imported += 1;
      } catch (rowErr: any) {
        errors.push(`Riadok ${i + 2}: ${rowErr.message}`);
      }
    }

    // Aktualizuj totalItems pre dotknuté kolekcie
    for (const collection of collectionCache.values()) {
      const count = await PogModel.countDocuments({
        collectionId: collection._id,
      });
      await CollectionModel.findByIdAndUpdate(collection._id, {
        totalItems: count,
      });
    }

    return NextResponse.json({
      success: true,
      imported,
      createdCollections,
      errors,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
