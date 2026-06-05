import mongoose, { Schema, model, models } from "mongoose";

const CollectionSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: "" },
    year: { type: Number, required: true },
    totalItems: { type: Number, default: 0 },
    coverImage: { type: String, default: "/placeholder-pog.svg" },
    manufacturer: { type: String, default: "" },
  },
  { timestamps: true }
);

const Collection =
  models.Collection || model("Collection", CollectionSchema);

export default Collection as mongoose.Model<any>;
