/**
 * فلسفة التصميم: ردهة المعهد الدافئة — حالة الحجز والثيم متاحة بوضوح من دون تمرير props عبر طبقات كثيرة.
 */
import type { Booking, Event } from "@/types/event";
import { bookingReducer } from "@/reducers/bookingReducer";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";

type Theme = "light" | "dark";

type BookingContextValue = {
  bookings: Booking[];
  bookingCount: number;
  drawerOpen: boolean;
  theme: Theme;
  reserveEvent: (event: Event) => boolean;
  decreaseBooking: (eventId: string) => void;
  removeBooking: (eventId: string) => void;
  clearBookings: () => void;
  selectedSeats: (eventId: string) => number;
  setDrawerOpen: (open: boolean) => void;
  toggleTheme: () => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [savedBookings, setSavedBookings] = useLocalStorage<Booking[]>("warsha-bookings", []);
  const [savedTheme, setSavedTheme] = useLocalStorage<Theme>("warsha-theme", "light");
  const [bookings, dispatch] = useReducer(bookingReducer, savedBookings);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // didUpdate: تستمر حجوزات وتجربة المستخدم بعد تحديث الصفحة.
  useEffect(() => {
    setSavedBookings(bookings);
  }, [bookings, setSavedBookings]);

  useEffect(() => {
    document.documentElement.dataset.theme = savedTheme;
  }, [savedTheme]);

  const selectedSeats = useCallback(
    (eventId: string) => bookings.find((booking) => booking.eventId === eventId)?.seats ?? 0,
    [bookings],
  );

  const reserveEvent = useCallback(
    (event: Event) => {
      const remaining = event.seats - event.reserved - selectedSeats(event.id);
      if (remaining <= 0) return false;
      dispatch({ type: "ADDED", eventId: event.id });
      return true;
    },
    [selectedSeats],
  );

  const decreaseBooking = useCallback((eventId: string) => dispatch({ type: "DECREASED", eventId }), []);
  const removeBooking = useCallback((eventId: string) => dispatch({ type: "REMOVED", eventId }), []);
  const clearBookings = useCallback(() => dispatch({ type: "CLEARED" }), []);
  const toggleTheme = useCallback(() => setSavedTheme((theme) => (theme === "light" ? "dark" : "light")), [setSavedTheme]);

  const value = useMemo(
    () => ({
      bookings,
      bookingCount: bookings.reduce((total, booking) => total + booking.seats, 0),
      drawerOpen,
      theme: savedTheme,
      reserveEvent,
      decreaseBooking,
      removeBooking,
      clearBookings,
      selectedSeats,
      setDrawerOpen,
      toggleTheme,
    }),
    [bookings, clearBookings, decreaseBooking, drawerOpen, removeBooking, reserveEvent, savedTheme, selectedSeats, toggleTheme],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBookings() {
  const context = useContext(BookingContext);
  if (!context) throw new Error("useBookings must be used inside BookingProvider");
  return context;
}
