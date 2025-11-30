// routes/checkout.js
import express from "express";
import Stripe from "stripe";

const router = express.Router();

// === Stripe ініціалізація ===
const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
}

const stripe = new Stripe(stripeSecret, {
  apiVersion: "2023-10-16",
});

// 🟢 Формуємо FRONTEND_URL з протоколом
const rawFrontendUrl = process.env.FRONTEND_URL;
const FRONTEND_URL =
  rawFrontendUrl && rawFrontendUrl.startsWith("http")
    ? rawFrontendUrl
    : rawFrontendUrl
    ? `https://${rawFrontendUrl}`
    : "http://localhost:5173";

// === POST /api/checkout-session ===
// створює Stripe Checkout Session і повертає session.url
router.post("/checkout-session", async (req, res) => {
  try {
    const { amount, currency, email, firstName, lastName } = req.body;

    if (!amount || !email) {
      return res.status(400).json({
        error: "Amount and email are required",
      });
    }

    const depositInCents = Math.round(Number(amount) * 100);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: currency || "usd",
      customer_email: email,
      payment_method_types: ["card"], // Apple Pay / Google Pay теж тут
      payment_intent_data: {
        setup_future_usage: "off_session", // зберегти карту для майбутніх оплат
        metadata: {
          firstName: firstName || "",
          lastName: lastName || "",
        },
      },
      line_items: [
        {
          price_data: {
            currency: currency || "usd",
            unit_amount: depositInCents,
            product_data: {
              name: "Danilets booking deposit",
              description:
                "Booking deposit for detailing services (deducted from total)",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${FRONTEND_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/book-online`,
    });

    // 🔥 новий підхід: повертаємо URL, а не sessionId
    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe Checkout Session ERROR:", err);
    res.status(500).json({
      error: "Failed to create checkout session",
      details: err.message,
    });
  }
});

// === GET /api/checkout-session/:id ===
// для сторінки /booking/success — перевірити статус
router.get("/checkout-session/:id", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.id, {
      expand: ["payment_intent"],
    });

    res.json({ session });
  } catch (err) {
    console.error("Checkout session retrieve error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
