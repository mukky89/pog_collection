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
    // Počet vlastnených kusov daného capu (duplikáty). 1 = mám jeden kus.
    quantity: { type: Number, default: 1, min: 0 },
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
