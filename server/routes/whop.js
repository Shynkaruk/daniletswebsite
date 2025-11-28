// server/routes/whop.js
import express from "express";
import Whop from "@whop/sdk";

const router = express.Router();

// Ініціалізуємо клієнт Whop
const whopClient = new Whop({
  apiKey: process.env.WHOP_API_KEY,
});

// POST /api/whop/checkout
router.post("/checkout", async (req, res) => {
  try {
    const { amount, currency = "usd", firstName, lastName, email } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    if (!process.env.WHOP_COMPANY_ID) {
      console.error("Missing WHOP_COMPANY_ID env");
      return res
        .status(500)
        .json({ error: "Server config error: WHOP_COMPANY_ID is missing" });
    }

    if (!process.env.WHOP_REDIRECT_URL) {
      console.error("Missing WHOP_REDIRECT_URL env");
      return res
        .status(500)
        .json({ error: "Server config error: WHOP_REDIRECT_URL is missing" });
    }

    // Створюємо checkout-конфігурацію з ДИНАМІЧНОЮ ціною
    const checkoutConfiguration = await whopClient.checkoutConfigurations.create(
      {
        mode: "payment",
        plan: {
          company_id: process.env.WHOP_COMPANY_ID,
          currency,
          initial_price: Number(amount), // наш депозит
        },
        metadata: {
          type: "detailing_deposit",
          deposit_amount: Number(amount),
          customer_email: email || null,
          customer_name: `${firstName || ""} ${lastName || ""}`.trim(),
        },
        redirect_url: process.env.WHOP_REDIRECT_URL,
      }
    );

    // purchase_url повертається типу `/checkout/ch_xxx?...`
    const purchasePath = checkoutConfiguration.purchase_url;
    const checkoutUrl = purchasePath.startsWith("http")
      ? purchasePath
      : `https://whop.com${purchasePath}`;

    return res.json({
      checkoutId: checkoutConfiguration.id,
      checkoutUrl,
    });
  } catch (err) {
    // максимум логів у консолі DigitalOcean
    console.error(
      "Whop checkout error:",
      err?.response?.data || err?.message || err
    );

    return res.status(500).json({
      error: "Failed to create checkout",
      details: err?.response?.data || null,
    });
  }
});

export default router;
