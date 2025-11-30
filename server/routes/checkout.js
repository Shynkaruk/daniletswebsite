// routes/checkout.js
import express from "express";
import Stripe from "stripe";

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

router.post("/checkout", async (req, res) => {
  try {
    const { amount, currency, email, firstName, lastName } = req.body;

    if (!amount || !email) {
      return res.status(400).json({
        error: "Amount and email are required",
      });
    }

    const amountInCents = Math.round(Number(amount) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency || "usd",
      receipt_email: email,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        firstName,
        lastName,
      },
      description: "Danilets booking deposit",
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error("Stripe paymentIntent ERROR:", err);
    res.status(500).json({
      error: "Failed to create payment",
      details: err.message,
    });
  }
});


// === НОВИЙ РОУТ: створення Stripe Checkout Session ===
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
      customer_email: email, // Stripe підв’яже карту до цього email
      payment_method_types: ["card"], // Apple Pay / Google Pay теж включаються сюди
      payment_intent_data: {
        // 👉 зберегти карту для майбутніх оплат (off-session)
        setup_future_usage: "off_session",
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
      // після успішної оплати
      success_url: `${process.env.FRONTEND_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      // якщо відмінив оплату
      cancel_url: `${process.env.FRONTEND_URL}/booking/cancel`,
    });

    res.json({ sessionId: session.id });
  } catch (err) {
    console.error("Stripe Checkout Session ERROR:", err);
    res.status(500).json({
      error: "Failed to create checkout session",
      details: err.message,
    });
  }
});

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
