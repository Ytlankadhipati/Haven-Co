import dotenv from "dotenv";

dotenv.config();

const BREVO_EMAIL_URL = "https://api.brevo.com/v3/smtp/email";
const EMAIL_TIMEOUT_MS = 10_000;

/** Send transactional HTML email through Brevo's HTTP API. */
export const sendEmail = async (to, subject, htmlContent) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.EMAIL_FROM;

  if (!apiKey || !senderEmail) {
    const missing = [
      !apiKey && "BREVO_API_KEY",
      !senderEmail && "EMAIL_FROM",
    ].filter(Boolean).join(", ");
    console.warn(`Email skipped; missing environment variable(s): ${missing}`);
    return { sent: false, skipped: true };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), EMAIL_TIMEOUT_MS);

  try {
    const response = await fetch(BREVO_EMAIL_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { name: "HavenCO", email: senderEmail },
        to: [{ email: to }],
        subject,
        htmlContent,
      }),
    });

    if (!response.ok) {
      throw new Error(`Brevo email request failed (HTTP ${response.status}).`);
    }
    return { sent: true };
  } catch (error) {
    const message = error?.name === "AbortError"
      ? "Brevo email request timed out after 10 seconds."
      : error?.message || "Unknown email delivery error.";
    throw new Error(message);
  } finally {
    clearTimeout(timeoutId);
  }
};
