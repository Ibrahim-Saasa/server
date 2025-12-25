import { Router } from "express";
import {
  registerUserController,
  verifyEmailController,
  loginUserController,
  logoutUserController,
  userProfileController,
  removeImage,
  updateUserDetails,
  forgotPasswordController,
  resetPasswordController,
} from "../controllers/user.controller.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const userRouter = Router();

userRouter.post("/register", registerUserController);
userRouter.post("/verify-email", verifyEmailController);
userRouter.post("/login", loginUserController);
userRouter.get("/logout", auth, logoutUserController);
userRouter.put(
  "/userProfile",
  auth,
  upload.array("avatar"),
  userProfileController
);
userRouter.delete("/deleteImage", auth, removeImage);
userRouter.put("/:id", auth, updateUserDetails);
userRouter.post("/forgotPassword", forgotPasswordController);
userRouter.post("/forgotPasswordOtp", resetPasswordController);

export default userRouter;
