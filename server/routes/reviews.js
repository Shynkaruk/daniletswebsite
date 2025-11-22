// routes/reviews.js
import express from "express";
import axios from "axios";
import "dotenv/config";

const router = express.Router();

// 👉 Place ID саме того бізнесу, де є Google-відгуки
const PLACE_ID = "ChIJFVGaxLp9OIgRwOVAPJkrA3A";
const API_KEY = process.env.GOOGLE_API_KEY;

// Виносимо в окрему функцію, щоб використовувати і в /google/detailing, і в /detailing
async function fetchGoogleDetailingReviews() {
  const url =
    "https://maps.googleapis.com/maps/api/place/details/json" +
    `?place_id=${PLACE_ID}` +
    "&fields=rating,reviews,user_ratings_total" + // 👉 явно просимо reviews
    "&reviews_sort=newest" +
    "&language=en" +
    `&key=${API_KEY}`;

  const response = await axios.get(url);

  // Для діагностики – подивитись, що саме вертає Google
  console.log("Google Place status:", response.data.status);
  console.log(
    "Google Place result keys:",
    response.data.result && Object.keys(response.data.result)
  );

  const result = response.data.result;

  if (!result || !Array.isArray(result.reviews)) {
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
    console.error(
      "Google Reviews Error (google/detailing):",
      err.response?.data || err.message
    );
    res.status(500).json({ error: "Failed to load Google reviews" });
  }
});

/**
 * 2) Загальний роут для Detailing (Home/Reviews блок)
 *    GET /api/reviews/detailing
 */
router.get("/detailing", async (req, res) => {
  try {
    const reviews = await fetchGoogleDetailingReviews();
    res.json({ reviews });
  } catch (err) {
    console.error(
      "Google Reviews Error (detailing):",
      err.response?.data || err.message
    );
    res.status(500).json({ error: "Failed to load Detailing reviews" });
  }
});

/**
 * 3) Cleaning — поки пусто
 */
router.get("/cleaning", async (req, res) => {
  res.json({ reviews: [] });
});

export default router;
