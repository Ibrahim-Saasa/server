import UserModel from "../models/user.model.js";
import bcryptjs from "bcryptjs"; // Fixed: was "bcruptjs"
import jwt from "jsonwebtoken";
import sendEmailFun from "../config/sendEmail.js";
import verificationEmail from "../config/verifyEmailTemplate.js"; // Add this import

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
