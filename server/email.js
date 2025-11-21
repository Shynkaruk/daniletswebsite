// email.js
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY || "";

if (!apiKey) {
  console.warn(
    "[email] RESEND_API_KEY is not set. Emails will NOT be sent, only logged."
  );
}

const resend = apiKey ? new Resend(apiKey) : null;

/**
 * Надіслати OTP-код на email.
 * @param {Object} params
 * @param {string} params.to       - email отримувача
 * @param {string} params.code     - 6-значний код
 * @param {string} params.purpose  - "signup" | "reset"
 */
export async function sendOtpEmail({ to, code, purpose = "signup" }) {
  const normalizedPurpose = purpose === "reset" ? "reset" : "signup";

  const subject =
    normalizedPurpose === "reset"
      ? "Reset your password – verification code"
      : "Confirm your email – verification code";

  const title =
    normalizedPurpose === "reset"
      ? "Password reset"
      : "Email verification";

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px;">
      <h1 style="font-size: 20px; margin-bottom: 12px;">${title}</h1>
      <p style="font-size: 14px; margin-bottom: 8px;">
        Your one-time code:
      </p>
      <p style="font-size: 26px; letter-spacing: 6px; font-weight: 700; margin: 12px 0;">
        ${code}
      </p>
      <p style="font-size: 13px; color: #4B5563;">
        The code is valid for 10 minutes. If you did not request it, just ignore this email.
      </p>
    </div>
  `;

  if (!resend) {
    // dev-режим: просто логнемо код, щоб можна було протестувати без пошти
    console.log(
      `[email] OTP for ${to}: ${code} (purpose=${normalizedPurpose})`
    );
    return;
  }

  const from =
    process.env.RESEND_FROM ||
    "Danilets Website <onboarding@resend.dev>"; // можна змінити на свій домен, якщо верифікований

  try {
    const result = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    console.log("[email] OTP email sent:", result?.id || result);
  } catch (err) {
    console.error("[email] Failed to send OTP email:", err);
    // пробросимо далі, щоб /api/auth/otp/send повернув 500
    throw err;
  }
}
