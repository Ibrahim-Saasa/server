import mongoose from "mongoose";
const { Schema } = mongoose;
const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    oldPrice: {
      type: Number,
      required: false,
      default: 0,
    },
    description: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    brand: {
      type: String,
      required: true,
      default: "",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: "",
    },
    categoryName: {
      type: String,
      required: true,
      default: "",
    },
    subCategoryId: {
      type: String,
      ref: "SubCategory",
      required: false,
      default: "",
    },
    subCategory: {
      type: String,
      required: false,
      default: "",
    },
    thirdCategoryId: {
      type: String,
      ref: "ThirdCategory",
      required: false,
      default: "",
    },
    thirdCategory: {
      type: String,
      required: false,
      default: "",
    },
    stock: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      required: false,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      required: false,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      required: false,
      default: false,
    },
    productRam: [
      {
        type: String,
        required: false,
        default: null,
      },
    ],
    size: [
      {
        type: String,
        required: false,
        default: null,
      },
    ],
    productWeight: [
      {
        type: String,
        required: false,
        default: null,
      },
    ],
    dateCreated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const ProductModel = mongoose.model("Products", ProductSchema);
export default ProductModel;
