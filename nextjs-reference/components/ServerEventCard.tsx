import Image from "next/image";
import Link from "next/link";
import type { Event } from "@/data/events";

// Server Component افتراضي: لا يستعمل حالة أو أحداث متصفح.
export function ServerEventCard({ event }: { event: Event }) {
  return (
    <article className="card">
      <Image src={event.image} alt="لقطة من أجواء الورشة" width={720} height={420} sizes="(max-width: 700px) 100vw, 33vw" />
      <p className="eyebrow">{event.category} · {event.seatsLeft} مقاعد متاحة</p>
      <h2>{event.title}</h2>
      <p className="muted">{event.description}</p>
      <Link className="button" href={`/events/${event.id}`}>عرض الفعالية</Link>
    </article>
  );
}
