import { getEventById } from "@/lib/events";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  return (
    <main>
      <Link href="/">← البرنامج</Link>
      <p className="eyebrow">مسار ديناميكي: /events/[id]</p>
      <h1>{event.title}</h1>
      <Image src={event.image} alt="صورة ورشة" width={1000} height={600} priority style={{ width: "100%", height: "auto" }} />
      <p className="muted">{event.description}</p>
      <p><b>المدرب:</b> {event.instructor} · <b>الوقت:</b> {event.date}، {event.time}</p>
      <Link className="button" href={`/bookings?eventId=${event.id}`}>انتقل إلى نموذج الحجز</Link>
    </main>
  );
}
