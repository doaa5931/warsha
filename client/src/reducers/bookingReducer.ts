/**
 * فلسفة التصميم: ردهة المعهد الدافئة — أحداث الحجز محددة وقابلة للتتبع بدل تعديلات حالة مبعثرة.
 */
import type { Booking, BookingAction } from "@/types/event";

export function bookingReducer(state: Booking[], action: BookingAction): Booking[] {
  switch (action.type) {
    case "ADDED": {
      const existing = state.find((booking) => booking.eventId === action.eventId);
      if (existing) {
        return state.map((booking) =>
          booking.eventId === action.eventId ? { ...booking, seats: booking.seats + 1 } : booking,
        );
      }
      return [...state, { eventId: action.eventId, seats: 1, createdAt: new Date().toISOString() }];
    }
    case "DECREASED":
      return state
        .map((booking) => (booking.eventId === action.eventId ? { ...booking, seats: booking.seats - 1 } : booking))
        .filter((booking) => booking.seats > 0);
    case "REMOVED":
      return state.filter((booking) => booking.eventId !== action.eventId);
    case "CLEARED":
      return [];
    case "RESTORED":
      return action.bookings;
    default:
      return state;
  }
}
