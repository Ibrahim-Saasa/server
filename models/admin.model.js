import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "superadmin"],
      default: "admin",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    name: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    age: {
      type: Number,
    },
    country: {
      type: String,
      default: "",
    },
    avatar: {
      type: String, // later: image URL
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
