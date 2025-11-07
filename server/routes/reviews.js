// routes/reviews.js
import express from 'express';
import axios from 'axios';

const router = express.Router();

const {
  GOOGLE_PLACES_API_KEY,
  GOOGLE_PLACE_ID_DETAILING,
  GOOGLE_PLACE_ID_CLEANING,
} = process.env;

const PLACE_IDS = {
  detailing: GOOGLE_PLACE_ID_DETAILING,
  cleaning: GOOGLE_PLACE_ID_CLEANING,
};

router.get('/reviews/:service', async (req, res) => {
  try {
    const service = req.params.service.toLowerCase();

    if (!PLACE_IDS[service]) {
      return res.status(400).json({ error: 'Unknown service type' });
    }

    const placeId = PLACE_IDS[service];

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=rating,user_ratings_total,reviews,name&key=${GOOGLE_PLACES_API_KEY}`;

    const { data } = await axios.get(url);

    if (data.status !== 'OK') {
      console.error('Google Places error:', data.status, data.error_message);
      return res.status(500).json({
        error: 'Google Places API error',
        status: data.status,
        message: data.error_message,
      });
    }

    const place = data.result || {};

    const reviews = (place.reviews || []).map((r, idx) => ({
      id: idx,
      name: r.author_name,
      review: r.text,
      rating: r.rating,
      relativeTime: r.relative_time_description,
      profilePhotoUrl: r.profile_photo_url,
    }));

    res.json({
      service,
      placeName: place.name,
      rating: place.rating,
      totalReviews: place.user_ratings_total,
      reviews,
    });
  } catch (err) {
    console.error('Error fetching Google reviews:', err.message);
    res.status(500).json({ error: 'Server error while fetching reviews' });
  }
});

export default router;
