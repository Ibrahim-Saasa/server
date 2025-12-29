import { Router } from "express";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";
import {
  addToMyList,
  deleteFromMyList,
  getFromMyList,
} from "../controllers/myList.controller.js";

const myListRouter = Router();

myListRouter.post("/add", auth, addToMyList);
myListRouter.delete("/delete/:id", auth, deleteFromMyList);
myListRouter.get("/getMyList", auth, getFromMyList);

export default myListRouter;
