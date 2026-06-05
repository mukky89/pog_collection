import mongoose, { Schema, model, models } from "mongoose";

// Pozn.: pole sa volá `collectionId` (nie `collection`), pretože `collection`
// je v Mongoose rezervovaný názov cesty a spôsobil by chybu pri behu.
const PogSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    collectionId: {
      type: Schema.Types.ObjectId,
      ref: "Collection",
      required: true,
      index: true,
    },
    number: { type: Number, required: true },
    rarity: {
      type: String,
      enum: ["common", "uncommon", "rare", "ultra-rare"],
      default: "common",
      index: true,
    },
    price: { type: Number, default: 0 }, // v centoch
    imageUrl: { type: String, default: "/placeholder-pog.svg" },
    imageBackUrl: { type: String },
    description: { type: String },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

PogSchema.index({ name: "text", description: "text" });

const Pog = models.Pog || model("Pog", PogSchema);

export default Pog as mongoose.Model<any>;
