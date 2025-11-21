// email.js
import { Resend } from "resend";

const {
  RESEND_API_KEY,
  RESEND_FROM_EMAIL = "Danilets Auth daniletswebsite@gmail.com",
} = process.env;

if (!RESEND_API_KEY) {
  console.error("[email] RESEND_API_KEY is not set!");
}

const resend = new Resend(RESEND_API_KEY);

/**
 * Відправка OTP-коду на email
 * purpose: "signup" | "reset"
 */
export async function sendOtpEmail({ to, code, purpose }) {
  if (!RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY missing, skip sending email");
    return;
  }

  const subject =
    purpose === "reset"
      ? "Password reset code"
      : "Email verification code";

  const text = `
Your one-time code: ${code}

This code is valid for 10 minutes.
If you did not request this, you can ignore this email.
`;

  const html = `
  <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#111; line-height:1.5;">
    <h2 style="margin-bottom:12px;">
      ${purpose === "reset" ? "Password reset" : "Email verification"}
    </h2>
    <p>Your one-time code:</p>
    <div style="font-size:24px; font-weight:700; letter-spacing:4px; margin:16px 0;">
      ${code}
    </div>
    <p style="font-size:14px; color:#555;">
      The code is valid for 10 minutes.<br />
      If you did not request this, you can ignore this email.
    </p>
  </div>
  `;

  try {
    const result = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to,
      subject,
      text,
      html,
    });
    console.log("[email] OTP sent:", result?.id || result);
  } catch (e) {
    console.error("[email] Failed to send OTP:", e?.message || e);
  }
}
