import jwt from "jsonwebtoken";

const auth = async (request, response, next) => {
  console.log("Auth middleware triggered");

  try {
    var token =
      request.cookies.accessToken ||
      request?.headers?.authorization?.split(" ")[1];

    console.log("Token found:", token ? "Yes" : "No");

    if (!token) {
      token = request.query.token;
    }

    if (!token) {
      console.log("❌ No token found");
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

    if (!decode || !decode.id) {
      console.log("❌ Invalid Token Payload");
      return response.status(401).json({
        message: "Invalid Token",
        error: true,
        success: false,
      });
    }

    console.log("Decoded Token ID:", decode.id);

    // Set the userId for the controller to use
    request.userId = decode.id;

    // Move to the next function (the controller)
    next();
  } catch (error) {
    console.log("❌ Auth Error:", error.message);
    return response.status(500).json({
      message: error.message || "You have not login",
      error: true,
      success: false,
    });
  }
};

export default auth;
