import mongoose from "mongoose";

const myListSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    productTitle: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    rating: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    oldPrice: {
      type: String,
      required: true,
    },
    discount: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const MyListModel = mongoose.model("myList", myListSchema);

export default MyListModel;
