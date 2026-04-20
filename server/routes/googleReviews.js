import express from "express";

const router = express.Router();

const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY;

const PLACE_IDS = {
  detailing: process.env.GOOGLE_PLACE_ID_DETAILING || "",
  cleaning: process.env.GOOGLE_PLACE_ID_CLEANING || "",
};

const cache = new Map();
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 годин

function mapGoogleReview(r) {
  return {
    id: r?.time || `${r?.author_name}-${Date.now()}`,
    name: r?.author_name || "Anonymous",
    rating: typeof r?.rating === "number" ? r.rating : null,
    relativeTime: r?.relative_time_description || "",
    review: r?.text || "",
    profilePhotoUrl: r?.profile_photo_url || "",
  };
}

async function placeDetails(placeId) {
  if (!GOOGLE_KEY) throw new Error("GOOGLE_PLACES_API_KEY is missing in .env");
  if (!placeId) throw new Error(`placeId for this service is missing in .env`);

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
    placeId
  )}&fields=name,rating,user_ratings_total,reviews,url&key=${encodeURIComponent(GOOGLE_KEY)}`;

  console.log(`[Google Reviews] Fetching for placeId: ${placeId}`);

  const res = await fetch(url);
  const json = await res.json();

  if (json?.status !== "OK") {
    console.error("[Google Reviews] Error from Google:", json);
    const msg = json?.error_message || json?.status || "Unknown Google error";
    throw new Error(`Google API: ${msg}`);
  }

  const result = json?.result || {};
  const reviews = Array.isArray(result.reviews) ? result.reviews : [];

  return {
    place: {
      name: result.name || "",
      rating: result.rating ?? null,
      total: result.user_ratings_total ?? null,
      url: result.url || "",
    },
    reviews: reviews
      .map(mapGoogleReview)
      .filter((x) => (x.review || "").trim().length > 10), // відфільтровуємо надто короткі
  };
}

// Основний ендпоінт
router.get("/google/:service", async (req, res) => {
  const service = String(req.params.service || "").toLowerCase().trim();

  if (!["detailing", "cleaning"].includes(service)) {
    return res.status(400).json({ error: "service must be 'detailing' or 'cleaning'" });
  }

  // Cache check
  const cached = cache.get(service);
  if (cached && cached.expiresAt > Date.now()) {
    return res.json(cached.data);
  }

  try {
    const placeId = PLACE_IDS[service];
    if (!placeId) {
      return res.status(400).json({ 
        error: `GOOGLE_PLACE_ID_${service.toUpperCase()} is not set in .env` 
      });
    }

    const data = await placeDetails(placeId);

    const payload = {
      source: "google",
      service,
      place: data.place,
      reviews: data.reviews,
      fetchedAt: new Date().toISOString(),
    };

    cache.set(service, { expiresAt: Date.now() + CACHE_TTL_MS, data: payload });

    res.json(payload);
  } catch (e) {
    console.error(`[Google Reviews] Error for ${service}:`, e.message);
    res.status(500).json({ 
      error: "Failed to load Google reviews",
      details: process.env.NODE_ENV === "development" ? e.message : undefined 
    });
  }
});

// Допоміжний ендпоінт для пошуку Place ID
router.get("/google/find-place-id", async (req, res) => {
  const q = String(req.query.q || "").trim();
  if (!q) return res.status(400).json({ error: "query parameter 'q' is required" });

  if (!GOOGLE_KEY) return res.status(500).json({ error: "GOOGLE_PLACES_API_KEY missing" });

  try {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(q)}&key=${encodeURIComponent(GOOGLE_KEY)}`;
    const r = await fetch(url);
    const j = await r.json();

    if (j?.status !== "OK") {
      return res.status(400).json({ error: j?.error_message || j?.status });
    }

    const first = j?.results?.[0];
    res.json({
      place_id: first?.place_id || null,
      name: first?.name || null,
      formatted_address: first?.formatted_address || null,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;