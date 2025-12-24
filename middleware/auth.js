import jwt from "jsonwebtoken";

const auth = async (request, response, next) => {
  try {
    const token =
      request.cookies.accessToken ||
      request?.headers?.authorization?.split(" ")[1];
    if (!token) {
      return response.status(401).json({
        message: "Provide Token",
        error: true,
        success: false,
      });
    }

    const decode = await jwt.verify(
      token,
      process.env.JSON_WEB_TOKEN_SECRET_KEY
    );
    if (!decode) {
      return response.status(401).json({
        message: "Invalid Token",
        error: true,
        success: false,
      });
    }
    request.user = decode;
    next();
  } catch (error) {
    return response.status(500).json({
      message: "You have not login",
      error: true,
      success: false,
    });
  }
};

export default auth;
