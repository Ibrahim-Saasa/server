import { Router } from "express";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";
const productRouter = Router();
import {
  createProduct,
  uploadProductImages,
  getProduct,
} from "../controllers/product.controller.js";

productRouter.post("/createProduct", auth, createProduct);
productRouter.post(
  "/uploadImages/:id",
  auth,
  upload.array("images"),
  uploadProductImages
);
productRouter.get("/getProduct/:id", auth, getProduct);

export default productRouter;
