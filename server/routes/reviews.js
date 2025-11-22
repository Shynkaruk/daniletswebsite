// routes/reviews.js
import express from "express";
import axios from "axios";
import "dotenv/config";

const router = express.Router();

const PLACE_ID = "ChIJFVGaxLp9OIgRwOVAPJkrA3A";
const API_KEY = process.env.GOOGLE_API_KEY;

router.get("/google/detailing", async (req, res) => {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&key=${API_KEY}`;
    const response = await axios.get(url);
    const result = response.data.result;

    if (!result || !result.reviews) {
      return res.json({ reviews: [] });
    }

    const formattedReviews = result.reviews.map((r) => ({
      name: r.author_name,
      profilePhotoUrl: r.profile_photo_url,
      rating: r.rating,
      relativeTime: r.relative_time_description,
      review: r.text,
    }));

    res.json({ reviews: formattedReviews });
  } catch (err) {
    console.error("Google Reviews Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to load Google reviews" });
  }
});

export default router;
