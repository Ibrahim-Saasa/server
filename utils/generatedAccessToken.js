import jwt from "jsonwebtoken";

const generateAccessToken = async (userId) => {
  const token = await jwt.sign(
    { id: userId },
    process.env.JSON_WEB_TOKEN_SECRET_KEY,
    { expiresIn: "1h" }
  );
  return token;
};
export default generateAccessToken;
