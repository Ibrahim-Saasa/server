import Admin from "../models/admin.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const adminLoginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // 2️⃣ Find admin
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 3️⃣ Check active status
    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Admin account is disabled",
      });
    }

    // 4️⃣ Verify password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 5️⃣ Generate JWT
    const token = jwt.sign(
      {
        id: admin._id,
        role: admin.role,
        type: "admin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 6️⃣ Success response
    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password");

    res.status(200).json({
      success: true,
      admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin profile",
    });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const { name, phone, age, country } = req.body;

    // ✅ FIXED: Use req.admin._id instead of req.admin.id
    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.admin._id, // ✅ Changed from req.admin.id
      { name, phone, age, country },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedAdmin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      admin: updatedAdmin,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      message: "Profile update failed",
      error: error.message,
    });
  }
};
