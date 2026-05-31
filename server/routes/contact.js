// server/routes/contact.js
import express from "express";
import { Resend } from "resend";
import { sendAdminPushNotification } from "../email.js";

const router = express.Router();

const resend = new Resend(process.env.RESEND_API_KEY);

// Куди відправляти ліди з форми
const TO_EMAIL =
  process.env.CONTACT_TO_EMAIL || process.env.RESEND_FROM_EMAIL;

/**
 * POST /api/contact
 * Body: {
 *   firstName, lastName, email, phone, service, description
 * }
 */
router.post("/", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, service, description } =
      req.body || {};

    if (!email || !description) {
      return res
        .status(400)
        .json({ error: "Email and message are required" });
    }

    const fullName = `${firstName || ""} ${lastName || ""}`.trim() || "Unknown";

    const subject = `New contact request from ${fullName}`;
    const html = `
      <h2>New contact request from website</h2>
      <p><strong>Name:</strong> ${fullName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || "-"}</p>
      <p><strong>Service:</strong> ${service || "-"}</p>
      <p><strong>Message:</strong></p>
      <p>${(description || "").replace(/\n/g, "<br/>")}</p>
    `;

    await resend.emails.send({
      from: `Danilets Website <${process.env.RESEND_FROM_EMAIL}>`,
      to: [TO_EMAIL],
      subject,
      html,
    });

    // Push notification — fire-and-forget
    sendAdminPushNotification({
      title: "🔔 New Contact Request",
      body: `From: ${fullName}`,
      url: "/admin",
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("Contact form email error:", err);
    return res
      .status(500)
      .json({ error: "Failed to send message. Please try again later." });
  }
});

export default router;
