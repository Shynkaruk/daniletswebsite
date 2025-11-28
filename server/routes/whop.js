import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/checkout", async (req, res) => {
  try {
    const { amount, currency, email, firstName, lastName } = req.body;

    const response = await axios.post(
      "https://api.whop.com/api/v2/charges",
      {
        amount: Math.round(amount * 100) / 100,
        currency: currency || "usd",
        customer_email: email,
        metadata: {
          firstName,
          lastName,
        },
        redirect_url: process.env.WHOP_REDIRECT_URL,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHOP_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.json({
      checkoutUrl: response.data.url,
    });
  } catch (err) {
    console.error("Whop createCheckout ERROR:");
    console.error("message:", err?.message);
    console.error("response data:", err?.response?.data);
    console.error("response status:", err?.response?.status);

    return res.status(500).json({
      error: "Failed to create checkout",
      details: err?.response?.data || err?.message || null,
    });
  }
});

export default router;
