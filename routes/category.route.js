import { Router } from "express";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";
import {
  getCategories,
  uploadCategory,
  uploadCategoryImages,
  getCategoryCount,
  getSubCategoryCount,
  getCategory,
  removeImage,
  deleteCategory,
  updateCategory,
} from "../controllers/category.controller.js";

const categoryRouter = Router();

categoryRouter.post("/uploadCategory", auth, uploadCategory);
categoryRouter.post(
  "/uploadImages/:id",
  auth,
  upload.array("images"),
  uploadCategoryImages
);
categoryRouter.get("/getCategories", auth, getCategories);
categoryRouter.get("/get/count", getCategoryCount);
categoryRouter.get("/get/subcategory/count", getSubCategoryCount);
categoryRouter.get("/:id", getCategory);
categoryRouter.delete("/deleteImage", auth, removeImage);
categoryRouter.delete("/deleteCategory/:id", auth, deleteCategory);
categoryRouter.put(
  "/updateCategory/:id",
  auth,
  upload.array("images"),
  updateCategory
);

export default categoryRouter;
