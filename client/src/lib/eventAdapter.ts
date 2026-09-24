import type { Event, EventCategory } from "@/types/event";

type ManagedEvent = {
  id: string; title: string; description: string; category: string; startAt: Date; durationMinutes: number;
  venue: string; instructor: string; level: string; capacity: number; imageUrl: string; accent: string; reserved: number;
};

export function toDisplayEvent(event: ManagedEvent): Event {
  const start = new Date(event.startAt);
  const date = start.toISOString().slice(0, 10);
  return {
    id: event.id,
    title: event.title,
    shortDescription: event.description,
    category: event.category as EventCategory,
    date,
    weekday: new Intl.DateTimeFormat("ar-SA", { weekday: "long" }).format(start),
    time: new Intl.DateTimeFormat("ar-SA", { hour: "2-digit", minute: "2-digit", hour12: false }).format(start),
    duration: `${event.durationMinutes / 60 % 1 === 0 ? event.durationMinutes / 60 : (event.durationMinutes / 60).toFixed(1)} ساعة`,
    venue: event.venue,
    instructor: event.instructor,
    level: event.level as Event["level"],
    seats: event.capacity,
    reserved: event.reserved,
    image: event.imageUrl,
    accent: event.accent,
  };
}
