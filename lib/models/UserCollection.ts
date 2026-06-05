import mongoose, { Schema, model, models } from "mongoose";

const UserCollectionSchema = new Schema(
  {
    pogId: {
      type: Schema.Types.ObjectId,
      ref: "Pog",
      required: true,
      unique: true,
      index: true,
    },
    owned: { type: Boolean, default: true },
    condition: {
      type: String,
      enum: ["mint", "good", "fair", "poor"],
    },
    acquiredDate: { type: Date },
    paidPrice: { type: Number }, // v centoch
    notes: { type: String },
  },
  { timestamps: true }
);

const UserCollection =
  models.UserCollection || model("UserCollection", UserCollectionSchema);

export default UserCollection as mongoose.Model<any>;
