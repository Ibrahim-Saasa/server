import { Router } from "express";
import { adminLoginController } from "../controllers/admin.controller.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";
import { adminAuth } from "../middleware/adminAuth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const adminRouter = Router();

adminRouter.post("/login", adminLoginController);
adminRouter.get("/profile", adminAuth, (req, res) => {
  res.json({
    success: true,
    admin: req.admin,
  });
});
adminRouter.get(
  "/dashboard-stats",
  adminAuth,
  requireRole("superadmin", "admin"),
  (req, res) => {
    res.json({
      success: true,
      message: "Superadmin access granted",
    });
  }
);

export default adminRouter;
