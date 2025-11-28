import express from "express";
import Whop from "@whop/sdk";

const router = express.Router();

const whop = new Whop({
  apiKey: process.env.WHOP_API_KEY,
});

/**
 * POST /api/whop/checkout
 * Створює динамічний one-time checkout на Whop
 */
router.post("/checkout", async (req, res) => {
  try {
    const { amount, email, firstName, lastName } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const checkout = await whop.checkoutConfigurations.create({
      company_id: process.env.WHOP_COMPANY_ID,
      mode: "payment",

      plan: {
        company_id: process.env.WHOP_COMPANY_ID,
        plan_type: "one_time",
        initial_price: amount,
        currency: "usd",
      },

      metadata: {
        email,
        name: `${firstName || ""} ${lastName || ""}`,
      },

      redirect_url: process.env.WHOP_REDIRECT_URL,
    });

    return res.json({
      url: checkout.purchase_url,
    });
  } catch (err) {
    console.error("Whop checkout error:", err);
    return res.status(500).json({ error: "Failed to create checkout" });
  }
});

export default router;
