import UserModel from "../models/user.model.js";
import jwt from "jsonwebtoken";

const generateRefreshToken = async (userId) => {
  const token = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET, // Use JWT_REFRESH_SECRET
    { expiresIn: "7d" }
  );

  const updatedUser = await UserModel.findByIdAndUpdate(
    userId,
    { refreshToken: token },
    { new: true }
  );
  return token;
};

export default generateRefreshToken;
