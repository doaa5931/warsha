import { describe, expect, it } from "vitest";
import { isReviewEligible, isValidRating, shouldCompleteBooking } from "./bookingRules";

describe("قواعد تقييمات ورشة", () => {
  it("لا يسمح بالتقييم قبل اكتمال الحجز", () => {
    expect(isReviewEligible("confirmed")).toBe(false);
    expect(isReviewEligible("completed")).toBe(true);
  });

  it("يقبل تقييمًا صحيحًا بين نجمة وخمس نجوم فقط", () => {
    expect(isValidRating(1)).toBe(true);
    expect(isValidRating(5)).toBe(true);
    expect(isValidRating(0)).toBe(false);
    expect(isValidRating(5.5)).toBe(false);
  });

  it("ينقل الحجز المؤكد إلى مكتمل بعد موعد انتهاء الفعالية", () => {
    expect(shouldCompleteBooking("confirmed", "ceramics-forms", new Date("2026-09-04T19:01:00Z"))).toBe(true);
    expect(shouldCompleteBooking("confirmed", "ceramics-forms", new Date("2026-09-04T18:59:00Z"))).toBe(false);
    expect(shouldCompleteBooking("cancelled", "ceramics-forms", new Date("2026-09-05T00:00:00Z"))).toBe(false);
  });
});
