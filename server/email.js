// email.js
import { Resend } from "resend";

const SERVICE_LABELS = {
  detailing_quote_personal: "Detailing – Personal",
  detailing_quote_business: "Detailing – Business / Fleet",
  cleaning_quote_residential: "Cleaning – Residential",
  cleaning_quote_commercial: "Cleaning – Commercial",
};

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
/**
 * Notify the admin when a new request/quote is submitted.
 * @param {Object} params
 * @param {string} params.serviceType   - e.g. "detailing_quote_personal"
 * @param {string} params.requestId     - MongoDB _id as string
 * @param {string} params.customerName  - first + last name of the customer (or guest)
 * @param {string} params.customerEmail - customer's email (optional)
 * @param {string} params.customerPhone - customer's phone (optional)
 * @param {string} [params.notes]       - short summary from notes_customer
 */
export async function sendAdminNewRequestNotification({
  serviceType,
  requestId,
  customerName,
  customerEmail,
  customerPhone,
  notes,
}) {
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL;
  if (!adminEmail) return; // not configured — skip silently

  const serviceLabel =
    SERVICE_LABELS[serviceType] || serviceType || "Unknown Service";

  const adminPanelUrl = `${process.env.FRONTEND_URL || "https://danilets.com"}/admin`;

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px; max-width: 600px;">
      <h2 style="font-size: 20px; margin-bottom: 16px; color: #111827;">
        New Request Submitted
      </h2>
      <table style="border-collapse: collapse; width: 100%; font-size: 14px;">
        <tr>
          <td style="padding: 6px 12px 6px 0; color: #6B7280; white-space: nowrap;">Service</td>
          <td style="padding: 6px 0; font-weight: 600; color: #111827;">${serviceLabel}</td>
        </tr>
        <tr>
          <td style="padding: 6px 12px 6px 0; color: #6B7280; white-space: nowrap;">Request ID</td>
          <td style="padding: 6px 0; font-family: monospace; color: #111827;">${requestId}</td>
        </tr>
        ${customerName ? `
        <tr>
          <td style="padding: 6px 12px 6px 0; color: #6B7280; white-space: nowrap;">Customer</td>
          <td style="padding: 6px 0; color: #111827;">${customerName}</td>
        </tr>` : ""}
        ${customerEmail ? `
        <tr>
          <td style="padding: 6px 12px 6px 0; color: #6B7280; white-space: nowrap;">Email</td>
          <td style="padding: 6px 0; color: #111827;"><a href="mailto:${customerEmail}" style="color: #2563EB;">${customerEmail}</a></td>
        </tr>` : ""}
        ${customerPhone ? `
        <tr>
          <td style="padding: 6px 12px 6px 0; color: #6B7280; white-space: nowrap;">Phone</td>
          <td style="padding: 6px 0; color: #111827;">${customerPhone}</td>
        </tr>` : ""}
      </table>

      ${notes ? `
      <div style="margin-top: 16px; padding: 12px; background: #F9FAFB; border-radius: 8px; font-size: 13px; color: #374151;">
        <strong>Summary:</strong><br/>${notes.substring(0, 400)}${notes.length > 400 ? "..." : ""}
      </div>` : ""}

      <div style="margin-top: 20px;">
        <a href="${adminPanelUrl}"
           style="display: inline-block; padding: 10px 20px; background: #111827; color: #fff; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none;">
          Open Admin Panel
        </a>
      </div>

      <p style="margin-top: 24px; font-size: 12px; color: #9CA3AF;">
        This is an automated notification from Danilets Website.
      </p>
    </div>
  `;

  if (!resend) {
    console.log(`[email] Admin notification (no Resend configured): New ${serviceLabel} from ${customerName || "guest"}`);
    return;
  }

  const from = process.env.RESEND_FROM || "Danilets Website <onboarding@resend.dev>";

  try {
    await resend.emails.send({
      from,
      to: adminEmail,
      subject: `New ${serviceLabel} Request — ${customerName || "Guest"}`,
      html,
    });
    console.log(`[email] Admin notification sent for request ${requestId}`);
  } catch (err) {
    // Never throw — notification failure must not break the request submission
    console.error("[email] Failed to send admin notification:", err);
  }
}

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
