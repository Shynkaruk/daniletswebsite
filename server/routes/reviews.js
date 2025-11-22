// routes/reviews.js
import express from "express";
import axios from "axios";
import "dotenv/config";

const router = express.Router();

// Place ID твоєї детейлінг-локації в Google Maps
const PLACE_ID = "ChIJFVGaxLp9OIgRwOVAPJkrA3A";
const API_KEY = process.env.GOOGLE_API_KEY;

// Окрема функція, щоб не дублювати код
async function fetchGoogleDetailingReviews() {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&key=${API_KEY}`;
  const response = await axios.get(url);

  const result = response.data.result;
  if (!result || !result.reviews) {
    return [];
  }

  return result.reviews.map((r) => ({
    name: r.author_name,
    profilePhotoUrl: r.profile_photo_url,
    rating: r.rating,
    relativeTime: r.relative_time_description,
    review: r.text,
  }));
}

/**
 * 1) Спеціальний Google-роут (Detailing page)
 *    GET /api/reviews/google/detailing
 */
router.get("/google/detailing", async (req, res) => {
  try {
    const reviews = await fetchGoogleDetailingReviews();
    res.json({ reviews });
  } catch (err) {
    console.error("Google Reviews Error (google/detailing):", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to load Google reviews" });
  }
});

/**
 * 2) Загальний роут для Detailing
 *    GET /api/reviews/detailing
 *    – використовує ті самі Google-відгуки
 */
router.get("/detailing", async (req, res) => {
  try {
    const reviews = await fetchGoogleDetailingReviews();
    res.json({ reviews });
  } catch (err) {
    console.error("Google Reviews Error (detailing):", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to load Detailing reviews" });
  }
});

/**
 * 3) Загальний роут для Cleaning
 *    GET /api/reviews/cleaning
 *    – поки що повертає пустий список (можеш потім підʼєднати інше джерело)
 */
router.get("/cleaning", async (req, res) => {
  try {
    // тимчасово без Google, просто пустий масив
    res.json({ reviews: [] });
  } catch (err) {
    console.error("Cleaning Reviews Error:", err.message);
    res.status(500).json({ error: "Failed to load Cleaning reviews" });
  }
});

export default router;
