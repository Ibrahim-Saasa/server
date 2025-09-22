import mongoose from "mongoose";

const cartProductSchema = new mongoose.Schema(
  {
    producId: {
      type: mongoose.Schema.ObjectId,
      ref: "product",
    },
    quantity: {
      type: Number,
      default: 1,
    },
    UserId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const CartProductModel = mongoose.model("cartProduct", cartProductSchema);

export default CartProductModel;
