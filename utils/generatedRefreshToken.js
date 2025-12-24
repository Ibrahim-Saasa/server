import UserModel from "../models/user.model.js";
import jwt from "jsonwebtoken";

const generateRefreshToken = async (userId) => {
  const token = await jwt.sign(
    { id: userId },
    process.env.JSON_WEB_REFRESH_SECRET_KEY,
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
