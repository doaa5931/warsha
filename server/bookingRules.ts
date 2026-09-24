/**
 * قواعد مجال ورشة: لا يصبح الحجز مؤهلًا للتقييم إلا بعد اكتماله فعليًا.
 */
export function isReviewEligible(status: string) {
  return status === "completed";
}

export function isValidRating(rating: number) {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

const eventEndTimes: Record<string, string> = {
  "ceramics-forms": "2026-09-04T19:00:00Z",
  "product-thinking": "2026-09-05T21:00:00Z",
  "street-frames": "2026-09-06T19:00:00Z",
  "poster-stories": "2026-09-11T18:00:00Z",
  "voice-notes": "2026-09-12T13:00:00Z",
  "natural-dyes": "2026-09-13T18:30:00Z",
};

export function shouldCompleteBooking(status: string, eventId: string, now = new Date()) {
  const endTime = eventEndTimes[eventId];
  return status === "confirmed" && Boolean(endTime) && now >= new Date(endTime);
}
