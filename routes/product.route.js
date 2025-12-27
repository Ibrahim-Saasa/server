import { Router } from "express";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";
const productRouter = Router();
import {
  createProduct,
  uploadProductImages,
  getProduct,
  getAllProducts,
  getAllProductsByCategory,
  getAllProductsByName,
  getAllProductsByPrice,
  getAllProductsByRating,
  countProducts,
  deleteProduct,
  deleteImage,
  updateProduct,
} from "../controllers/product.controller.js";

productRouter.post("/createProduct", auth, createProduct);
productRouter.post(
  "/uploadImages/:id",
  auth,
  upload.array("images"),
  uploadProductImages
);
productRouter.get("/getProduct/:id", getProduct);
productRouter.get("/getAllProducts", getAllProducts);
productRouter.get("/getAllProductsByCategory/:id", getAllProductsByCategory);
productRouter.get("/getAllProductsByName/:name", getAllProductsByName);
productRouter.get("/getAllProductsByPrice", getAllProductsByPrice);
productRouter.get("/getAllProductsByRating", getAllProductsByRating);
productRouter.get("/countProducts", countProducts);
productRouter.delete("/deleteProduct/:id", auth, deleteProduct);
productRouter.delete("/deleteImages/:id", auth, deleteImage);
productRouter.put("/updateProduct/:id", auth, updateProduct);

export default productRouter;
