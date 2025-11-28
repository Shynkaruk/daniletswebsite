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

export default router;
