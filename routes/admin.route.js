import { Router } from "express";
import {
  adminLoginController,
  getAdminProfile,
  updateAdminProfile,
} from "../controllers/admin.controller.js";
import { adminAuth } from "../middleware/adminAuth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const adminRouter = Router();

adminRouter.post("/login", adminLoginController);
adminRouter.get("/me", adminAuth, getAdminProfile);
adminRouter.put("/profile", adminAuth, updateAdminProfile); // ✅ Added adminAuth
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
