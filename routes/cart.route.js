import { Router } from "express";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";
import {
  addToCart,
  getCartItems,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cart.controller.js";

const cartRouter = Router();
cartRouter.post("/add", auth, addToCart);
cartRouter.get("/", auth, getCartItems);
cartRouter.put("/update/:cartItemId", auth, upload.none(), updateCartItem);
cartRouter.delete("/remove/:productId", auth, removeFromCart);
cartRouter.delete("/clear", auth, clearCart);

export default cartRouter;
