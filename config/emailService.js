const http = require("http");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransporter({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail(to, subject, text, html) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL, // Fixed: was process.enc.Email
      to,
      subject,
      text,
      html,
    });

    return { success: true, messageId: info.messageId }; // Fixed: was sucess
  } catch (error) {
    console.error("Error sending email:", error); // Fixed: missing comma
    return { success: false, error: error.message }; // Fixed: was sucess
  }
}

module.exports = { sendEmail };
