import express from "express";

const router = express.Router();

const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY;

// Задай placeId тут (коли знайдеш). Можна і через env.
const PLACE_IDS = {
  detailing: process.env.GOOGLE_PLACE_ID_DETAILING || "",
  cleaning: process.env.GOOGLE_PLACE_ID_CLEANING || "",
};

// Простий in-memory cache
const cache = new Map();
// key: "detailing" | "cleaning" -> { expiresAt: number, data: any }

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6h

function mapGoogleReview(r) {
  return {
    id: r?.time || `${r?.author_name}-${Math.random()}`,
    name: r?.author_name || "Anonymous",
    rating: typeof r?.rating === "number" ? r.rating : null,
    relativeTime: r?.relative_time_description || "",
    review: r?.text || "",
    profilePhotoUrl: r?.profile_photo_url || "",
  };
}

async function placeDetails(placeId) {
  if (!GOOGLE_KEY) throw new Error("GOOGLE_PLACES_API_KEY missing");
  if (!placeId) throw new Error("placeId missing");

  // Place Details (Fields)
  // docs: fields=reviews,name,rating,user_ratings_total,url
  const url =
    "https://maps.googleapis.com/maps/api/place/details/json" +
    `?place_id=${encodeURIComponent(placeId)}` +
    `&fields=${encodeURIComponent("name,rating,user_ratings_total,reviews,url")}` +
    `&key=${encodeURIComponent(GOOGLE_KEY)}`;

  const res = await fetch(url);
  const json = await res.json();

  if (json?.status !== "OK") {
    const msg = json?.error_message || json?.status || "Google Places error";
    throw new Error(msg);
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
      // зазвичай Google віддає 5, але інколи менше
      .map(mapGoogleReview)
      // без порожнього тексту (за бажанням)
      .filter((x) => (x.review || "").trim().length > 0),
  };
}

// (опціонально) Автопошук place_id по тексту — щоб ти не шукав руками
router.get("/google/find-place-id", async (req, res) => {
  const q = String(req.query.q || "").trim();
  if (!q) return res.status(400).json({ error: "q required" });

  if (!GOOGLE_KEY) return res.status(500).json({ error: "GOOGLE_PLACES_API_KEY missing" });

  const url =
    "https://maps.googleapis.com/maps/api/place/textsearch/json" +
    `?query=${encodeURIComponent(q)}` +
    `&key=${encodeURIComponent(GOOGLE_KEY)}`;

  const r = await fetch(url);
  const j = await r.json();

  if (j?.status !== "OK") {
    return res.status(400).json({ error: j?.error_message || j?.status || "Google error" });
  }

  const first = j?.results?.[0];
  return res.json({
    place_id: first?.place_id || null,
    name: first?.name || null,
    formatted_address: first?.formatted_address || null,
  });
});

// Основний endpoint
router.get("/google/:service", async (req, res) => {
  const service = String(req.params.service || "").toLowerCase();

  if (!["detailing", "cleaning"].includes(service)) {
    return res.status(400).json({ error: "service must be detailing|cleaning" });
  }

  // cache
  const cached = cache.get(service);
  if (cached && cached.expiresAt > Date.now()) {
    return res.json(cached.data);
  }

  try {
    const placeId = PLACE_IDS[service];
    const data = await placeDetails(placeId);

    const payload = {
      source: "google",
      service,
      place: data.place,
      reviews: data.reviews,
    };

    cache.set(service, { expiresAt: Date.now() + CACHE_TTL_MS, data: payload });

    res.json(payload);
  } catch (e) {
    res.status(500).json({ error: e?.message || "Failed to fetch Google reviews" });
  }
});

export default router;