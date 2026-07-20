import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// Shared email helper — used by password reset, booking confirmations,
// manager approval notices, etc. across the whole app.
export const sendEmail = async (to, subject, body) => {
  try {
    await transporter.sendMail({
      from: `"HavenCO" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: body,
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error("❌ Email failed to send:", error.message);
    // Intentionally don't throw — a failed email shouldn't crash the
    // request that triggered it (e.g. forgot-password should still
    // return success even if the email provider is briefly down).
  }
};