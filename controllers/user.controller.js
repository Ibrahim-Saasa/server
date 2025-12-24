import UserModel from "../models/user.model.js";
import bcryptjs from "bcryptjs"; // Fixed: was "bcruptjs"
import jwt from "jsonwebtoken";
import sendEmailFun from "../config/sendEmail.js";
import verificationEmail from "../utils/verifyEmailTemplate.js"; // Add this import
import generateAccessToken from "../utils/generatedAccessToken.js";
import generateRefreshToken from "../utils/generatedRefreshToken.js";

export async function registerUserController(request, response) {
  try {
    let user;
    const { name, email, password } = request.body;

    if (!name || !email || !password) {
      return response.status(400).json({
        message: "provide email, name, password",
        error: true,
        success: false,
      });
    }

    user = await UserModel.findOne({ email: email });
    if (user) {
      return response.json({
        message: "This Email Is Already Registered!",
        error: true,
        success: false,
      });
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);

    user = new UserModel({
      email: email,
      password: hashPassword,
      name: name,
      verifyCode: verifyCode, // Store verification code in user model
      isVerified: false, // Add verification status
      verifyCodeExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
    });

    await user.save();

    // Generate HTML email template
    const emailHTML = verificationEmail(name, verifyCode);

    const emailResult = await sendEmailFun({
      sendTo: email,
      subject: "Verify Your Email - Ecommerce App",
      text: `Hello ${name}, your verification code is: ${verifyCode}`,
      html: emailHTML,
    });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JSON_WEB_TOKEN_SECRET_KEY
    );

    if (emailResult.success) {
      return response.status(200).json({
        message:
          "Registration successful! Please check your email for verification code.",
        error: false,
        success: true,
        data: {
          userId: user._id,
          email: user.email,
          name: user.name,
        },
      });
    } else {
      await UserModel.deleteOne({ _id: user._id });
      return response.status(500).json({
        message: "Failed to send verification email. Please try again.",
        error: true,
        success: false,
      });
    }
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function verifyEmailController(request, response) {
  try {
    const { email, verifyCode } = request.body;

    const user = await UserModel.findOne({ email: email });
    if (!user) {
      return response.status(400).json({
        message: "User not found.",
        error: true,
        success: false,
      });
    }
    const isCodeValid = user.verifyCode === verifyCode;
    const isCodeExpired = new Date() > user.verifyCodeExpiry;

    if (isCodeValid && !isCodeExpired) {
      user.isVerified = true;
      user.verifyCode = null;
      user.verifyCodeExpiry = null;
      await user.save();
      return response.status(200).json({
        message: "Email verified successfully!",
        error: false,
        success: true,
      });
    } else if (isCodeExpired) {
      return response.status(400).json({
        message: "Verification code has expired.",
        error: true,
        success: false,
      });
    } else {
      return response.status(400).json({
        message: "Invalid verification code.",
        error: true,
        success: false,
      });
    }
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function loginUserController(request, response) {
  try {
    const { email, password } = request.body;
    const user = await UserModel.findOne({ email: email });

    if (user.status !== "Active") {
      return response.status(400).json({
        message: "Contact support to activate your account.",
        error: true,
        success: false,
      });
    }

    const isPasswordMatch = await bcryptjs.compare(password, user.password);
    if (!isPasswordMatch) {
      return response.status(400).json({
        message: "Invalid credentials.",
        error: true,
        success: false,
      });
    }

    const accessToken = await generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user._id);

    const updatedUser = await UserModel.findByIdAndUpdate(
      user._id,
      {
        access_token: accessToken,
        refresh_token: refreshToken,
        last_login_date: new Date(),
      },
      { new: true }
    );

    const cookiesOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };
    response.cookie("accessToken", accessToken, cookiesOptions);
    response.cookie("refreshToken", refreshToken, cookiesOptions);

    return response.status(200).json({
      message: "Login successful.",
      error: false,
      success: true,
      data: {
        user: updatedUser,
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function logoutUserController(request, response) {
  try {
    const userId = request.userId;
    await UserModel.findByIdAndUpdate(userId, {
      access_token: null,
      refresh_token: null,
    });
    const cookiesOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };
    response.clearCookie("accessToken", cookiesOptions);
    response.clearCookie("refreshToken", cookiesOptions);

    const removedTokens = await UserModel.findByIdAndUpdate(userId, {
      refresh_token: "",
    });
    return response.status(200).json({
      message: "Logout successful.",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}
