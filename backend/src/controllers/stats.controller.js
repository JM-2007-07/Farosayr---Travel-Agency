// Same reasoning as gallery.controller.js — no `Stats` model was ever
// specified in the schema. These are marketing figures, not an aggregate
// computed from real bookings/reviews (that would be a reasonable future
// enhancement — e.g. deriving "positive reviews %" from real Review.rating
// data — but doing so wasn't requested for this sub-phase and would be
// inventing business logic outside its scope).
const STATS = [
  { id: 'travelers', target: 250, suffix: '+', label: 'Путешественников' },
  { id: 'destinations', target: 12, suffix: '', label: 'Направлений' },
  { id: 'positive-reviews', target: 98, suffix: '%', label: 'Положительных отзывов' },
  { id: 'support', target: 24, suffix: '/7', label: 'Поддержка клиентов' },
];

export async function listStats(req, res) {
  res.status(200).json({ success: true, data: STATS });
}
