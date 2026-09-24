import { afterEach, describe, expect, it } from "vitest";
import { completeBookingForAdmin, createBooking, getBookingsForUser, getEvents, getNotificationsForUser, registerLocalUser, resetLocalStoreForTests } from "./db";

describe("تدفق ورشة المحلي", () => {
  afterEach(() => resetLocalStoreForTests());

  it("ينشئ الحساب الأول ويحجز فعالية ويرى التأكيد ثم حالة الإتمام", async () => {
    resetLocalStoreForTests();
    const { user } = registerLocalUser({ name: "حساب محلي", email: "local@warsha.test", password: "local-pass-123" });
    const event = (await getEvents("published"))[0];
    expect(user.role).toBe("admin");
    expect(event).toBeDefined();
    const bookingId = await createBooking({ userId: user.id, eventId: event!.id, attendeeName: "حساب محلي", attendeeEmail: "local@warsha.test", seats: 1, status: "confirmed" });
    expect((await getNotificationsForUser(user.id))[0]?.type).toBe("confirmation");
    await completeBookingForAdmin(bookingId);
    expect((await getBookingsForUser(user.id))[0]?.status).toBe("completed");
  });
});
