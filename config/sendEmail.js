import sendEmail from "./emailService.js"; // Fixed: added .js extension

const sendEmailFun = async ({ sendTo, subject, text, html }) => {
  // Fixed: destructured parameters to match usage
  const result = await sendEmail(sendTo, subject, text, html);
  if (result.success) {
    return { success: true, messageId: result.messageId };
  } else {
    return { success: false, error: result.error };
  }
};

export default sendEmailFun;
