/**
 * فلسفة التصميم: ردهة المعهد الدافئة — نماذج صغيرة وواضحة تجعل بيانات الفعالية قابلة للقراءة والتوسعة.
 */
export type EventCategory = "تصميم" | "تقنية" | "حِرف" | "تصوير";

export type Event = {
  id: string;
  title: string;
  shortDescription: string;
  category: EventCategory;
  date: string;
  weekday: string;
  time: string;
  duration: string;
  venue: string;
  instructor: string;
  level: "مبتدئ" | "متوسط" | "مفتوح للجميع";
  seats: number;
  reserved: number;
  image: string;
  accent: string;
};

export type Booking = {
  eventId: string;
  seats: number;
  createdAt: string;
};

export type BookingAction =
  | { type: "ADDED"; eventId: string }
  | { type: "DECREASED"; eventId: string }
  | { type: "REMOVED"; eventId: string }
  | { type: "CLEARED" }
  | { type: "RESTORED"; bookings: Booking[] };
