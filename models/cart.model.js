import mongoose from "mongoose";

const cartProductSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: "Products",
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
