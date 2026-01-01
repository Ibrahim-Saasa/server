import jwt from "jsonwebtoken";

const generateAccessToken = async (userId) => {
  const token = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET, // Use JWT_SECRET
    { expiresIn: "24h" }
  );
  return token;
};

export default generateAccessToken;
