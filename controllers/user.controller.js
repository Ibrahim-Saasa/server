import UserModel from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmailFun from "../config/sendEmail.js";
import verificationEmail from "../utils/verifyEmailTemplate.js";
import generateAccessToken from "../utils/generatedAccessToken.js";
import generateRefreshToken from "../utils/generatedRefreshToken.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { url } from "inspector";
import { error } from "console";
import { verify } from "crypto";
import { send } from "process";

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

export async function registerUserController(request, response) {
  console.log("REGISTER CONTROLLER HIT");

  try {
    const { name, email, phone, password } = request.body;

    // 1. Validation
    if (!name || !email || !phone || !password) {
      return response.status(400).json({
        success: false,
        error: true,
        message: "All fields are required",
      });
    }

    // 2. Check existing user
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return response.status(409).json({
        success: false,
        error: true,
        message: "User already exists",
      });
    }

    // 3. Generate verification code
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 4. Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);

    // 5. Create user with verification code
    const user = new UserModel({
      name,
      email,
      phone,
      password: hashPassword,
      verifyCode: verifyCode,
      verify_email: false,
      verifyCodeExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    await user.save();

    // 6. Generate HTML email template
    const emailHTML = verificationEmail(name, verifyCode);

    // 7. Send verification email
    const emailResult = await sendEmailFun({
      sendTo: email,
      subject: "Verify Your Email - Ecommerce App",
      text: `Hello ${name}, your verification code is: ${verifyCode}`,
      html: emailHTML,
    });

    if (emailResult.success) {
      return response.status(201).json({
        success: true,
        error: false,
        message:
          "Registration successful! Please check your email for verification code.",
        data: {
          userId: user._id,
          email: user.email,
          name: user.name,
        },
      });
    } else {
      // If email fails, delete the user
      await UserModel.deleteOne({ _id: user._id });
      return response.status(500).json({
        success: false,
        error: true,
        message: "Failed to send verification email. Please try again.",
      });
    }
  } catch (error) {
    console.error("Register error:", error);
    return response.status(500).json({
      success: false,
      error: true,
      message: error.message || "Internal server error",
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
      user.verify_email = true; // Only use verify_email
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

    // Check if email and password are provided
    if (!email || !password) {
      return response.status(400).json({
        message: "Please provide email and password",
        error: true,
        success: false,
      });
    }

    // Find user by email
    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return response.status(400).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    // Check if email is verified
    if (!user.verify_email) {
      return response.status(403).json({
        message: "Please verify your email before logging in",
        error: true,
        success: false,
      });
    }

    // Compare password
    const isPasswordMatch = await bcryptjs.compare(password, user.password);
    if (!isPasswordMatch) {
      return response.status(400).json({
        message: "Invalid credentials",
        error: true,
        success: false,
      });
    }

    // Generate tokens
    const accessToken = await generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user._id);

    // Update user with tokens
    const updatedUser = await UserModel.findByIdAndUpdate(
      user._id,
      {
        access_token: accessToken,
        refresh_token: refreshToken,
        last_login_date: new Date(),
      },
      { new: true }
    );

    // Set cookies
    const cookiesOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };
    response.cookie("accessToken", accessToken, cookiesOptions);
    response.cookie("refreshToken", refreshToken, cookiesOptions);

    return response.status(200).json({
      message: "Login successful",
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

export async function userProfileController(request, response) {
  try {
    const userId = request.userId;
    const files = request.files; // Use request.files for .array()

    if (!files || files.length === 0) {
      return response.status(400).json({ message: "No files uploaded" });
    }

    const imagesArr = [];

    // Use for...of for cleaner async/await handling
    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "profile_pics",
      });

      imagesArr.push(result.secure_url);

      // Delete from local 'upload' folder after Cloudinary upload
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }

    // Update the user model with the new image URL
    await UserModel.findByIdAndUpdate(userId, { avatar: imagesArr[0] });

    return response.status(200).json({
      message: "Profile updated",
      _id: userId,
      profileImage: imagesArr[0],
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

export async function removeImage(request, response) {
  try {
    const userId = request.userId; // ADD THIS LINE
    const imageUrl = request.query.img;

    if (!imageUrl || typeof imageUrl !== "string") {
      return response.status(400).json({
        message: "Valid image URL is required in query params",
        success: false,
      });
    }

    const user = await UserModel.findOne({ _id: userId });

    if (!user) {
      return response.status(404).json({
        message: "User not found",
        success: false,
        error: true,
      });
    }

    const urlParts = imageUrl.split("/");
    const fileNameWithExtension = urlParts[urlParts.length - 1];
    const folderName = urlParts[urlParts.length - 2];
    const publicId = `${folderName}/${fileNameWithExtension.split(".")[0]}`;

    console.log("Attempting to delete Public ID:", publicId);

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      // Clear the avatar in the database
      user.avatar = "";
      await user.save();

      return response.status(200).json({
        message: "Image removed successfully from Cloudinary",
        success: true,
      });
    } else {
      return response.status(400).json({
        message: "Cloudinary could not find the image",
        result: result.result,
      });
    }
  } catch (error) {
    console.error("Delete Error:", error);
    return response.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
}

export async function updateUserDetails(request, response) {
  try {
    const userId = request.userId;
    const { name, phone, email, password } = request.body;

    const userExist = await UserModel.findById(userId);
    if (!userExist) {
      return response.status(404).json({ message: "User not found" });
    }

    // --- EVERYTHING BELOW MUST BE OUTSIDE THE IF (!userExist) BLOCK ---

    let verifyCode = "";
    if (email && email !== userExist.email) {
      verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    }

    let hashPassword = userExist.password;
    if (password) {
      const salt = await bcryptjs.genSalt(10);
      hashPassword = await bcryptjs.hash(password, salt);
    }

    const updatedData = await UserModel.findByIdAndUpdate(
      userId,
      {
        name,
        phone,
        email,
        verify_email:
          email !== userExist.email ? false : userExist.verify_email,
        password: hashPassword,
        verifyCode: verifyCode || null,
        verifyCodeExpiry: verifyCode
          ? new Date(Date.now() + 10 * 60 * 1000)
          : null,
      },
      { new: true }
    );

    if (email && email !== userExist.email) {
      await sendEmailFun({
        sendTo: email,
        subject: "Verify Your New Email",
        text: `Code: ${verifyCode}`,
        html: `<strong>${verifyCode}</strong>`,
      });
    }

    return response.status(200).json({
      message: "User updated successfully",
      success: true,
      data: updatedData,
    });
  } catch (error) {
    return response.status(500).json({ message: error.message, error: true });
  }
}

export async function forgotPasswordController(request, response) {
  try {
    const { email } = request.body;
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      return response.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    } else {
      const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
      const verifyCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);

      user.verifyCode = verifyCode;
      user.verifyCodeExpiry = verifyCodeExpiry;

      await user.save();

      await user.save();
      await sendEmailFun({
        sendTo: email,
        subject: "Password Reset Code",
        text: `Code: ${verifyCode}`,
        html: `<strong>${verifyCode}</strong>`,
      });
      return response.status(200).json({
        message: "Verification code sent to email",
        success: true,
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

export async function resetPasswordController(request, response) {
  try {
    const { email, verifyCode } = request.body;

    const user = await UserModel.findOne({ email: email });
    if (!user) {
      return response.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    if (!email || !verifyCode) {
      return response.status(400).json({
        message: "Email and verification code are required",
        error: true,
        success: false,
      });
    }

    if (user.verifyCode !== verifyCode) {
      return response.status(400).json({
        message: "Invalid verification code",
        error: true,
        success: false,
      });
    }

    const isCodeExpired = new Date() > user.verifyCodeExpiry;
    if (isCodeExpired) {
      return response.status(400).json({
        message: "Verification code has expired",
        error: true,
        success: false,
      });
    }

    user.verifyCode = "";
    user.verifyCodeExpiry = "";
    await user.save();

    return response.status(200).json({
      message: "Verification successful. You can now reset your password.",
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

export async function resetUserPasswordController(request, response) {
  try {
    const { email, newPassword, confirmPassword } = request.body;

    if (!email || !newPassword || !confirmPassword) {
      return response.status(400).json({
        message: "Email, new password, and confirm password are required",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({ email: email });
    if (!user) {
      return response.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    if (newPassword !== confirmPassword) {
      return response.status(400).json({
        message: "Passwords do not match",
        error: true,
        success: false,
      });
    }

    const salt = await bcryptjs.genSalt(12);
    const hashPassword = await bcryptjs.hash(newPassword, salt);

    user.password = hashPassword;
    await user.save();

    return response.status(200).json({
      message: "Password reset successfully",
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

export async function refreshTokenController(request, response) {
  try {
    const refreshToken =
      request.cookies.refreshToken ||
      request?.headers?.authorization?.split(" ")[1];

    if (!refreshToken) {
      return response.status(401).json({
        message: "Provide Refresh Token",
        error: true,
        success: false,
      });
    }

    const verifyToken = await jwt.verify(
      refreshToken,
      process.env.JSON_WEB_REFRESH_SECRET_KEY
    );

    if (!verifyToken || !verifyToken.id) {
      return response.status(401).json({
        message: "Invalid Refresh Token",
        error: true,
        success: false,
      });
    }

    const userId = verifyToken?._id;

    const newAccessToken = await generateAccessToken(userId);

    const cookiesOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };
    response.cookie("accessToken", newAccessToken, cookiesOptions);

    return response.status(200).json({
      message: "Access token refreshed successfully",
      error: false,
      success: true,
      data: {
        accessToken: newAccessToken,
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

export async function getAllUsersController(request, response) {
  try {
    const userId = request.userId;
    const users = await UserModel.findById(userId).select(
      "-password -refresh_token "
    );
    return response.status(200).json({
      message: "Users retrieved successfully",
      success: true,
      data: users,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}
