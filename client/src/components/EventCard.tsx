/**
 * فلسفة التصميم: ردهة المعهد الدافئة — بطاقة برنامج ذات ختم مقاعد وبيانات وقت واضحة وصورة مختلفة لكل تجربة.
 */
import type { Event } from "@/types/event";
import { CalendarDays, Clock3, MapPin, Plus, Sparkles } from "lucide-react";
import { memo } from "react";
import styles from "./EventCard.module.scss";

type EventCardProps = {
  event: Event;
  selectedSeats: number;
  onReserve: (event: Event) => void;
  onPreview: (event: Event) => void;
  featured?: boolean;
  className?: string;
};

function EventCardComponent({ event, selectedSeats, onReserve, onPreview, featured = false, className = "" }: EventCardProps) {
  const remaining = event.seats - event.reserved - selectedSeats;
  const isSoldOut = remaining <= 0;

  return (
    <article className={`${styles.card} ${featured ? styles.featured : ""} ${className}`}>
      <div className={styles.imageWrap}>
        <img className={styles.image} src={event.image} alt="" />
        <div className={styles.imageShade} />
        <span className="absolute right-4 top-4 rounded-full bg-[#fbf7ee]/92 px-3 py-1 text-xs font-bold text-[#123D3A] backdrop-blur-sm">
          {event.category}
        </span>
        <div className={`absolute bottom-4 left-4 ${styles.stamp} text-[#fbf7ee]`}>
          {isSoldOut ? "اكتملت\nالمقاعد" : `${remaining}\nمقاعد`}
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="mb-1 text-xs font-bold tracking-[0.14em] text-[#c55632]">{event.weekday} · {event.date.slice(8, 10)}/09</p>
            <h3 className="font-display text-lg font-extrabold leading-8 text-[#123D3A]">{event.title}</h3>
          </div>
          {selectedSeats > 0 && <span className="shrink-0 rounded-full bg-[#123D3A] px-2.5 py-1 text-xs font-bold text-white">اختيارك {selectedSeats}</span>}
        </div>

        <p className="min-h-13 text-sm leading-7 text-[#5c665f]">{event.shortDescription}</p>

        <div className="mt-5 space-y-2 border-y border-[#e8dfcf] py-4 text-xs font-medium text-[#53625e]">
          <p className="flex items-center gap-2"><CalendarDays size={15} className="text-[#c55632]" /> {event.date} · {event.weekday}</p>
          <p className="flex items-center gap-2"><Clock3 size={15} className="text-[#c55632]" /> {event.time} · {event.duration}</p>
          <p className="flex items-center gap-2"><MapPin size={15} className="text-[#c55632]" /> {event.venue}</p>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2d514d]"><Sparkles size={14} /> مع {event.instructor}</span>
          <div className="flex items-center gap-2">
            <button onClick={() => onPreview(event)} className="text-sm font-bold text-[#123D3A] underline decoration-[#d8c9b3] underline-offset-4 transition hover:decoration-[#123D3A]">التفاصيل</button>
            <button
              onClick={() => onReserve(event)}
              disabled={isSoldOut}
              className="inline-flex h-10 items-center gap-1.5 bg-[#123D3A] px-3.5 text-sm font-bold text-white transition hover:bg-[#0b2e2c] active:scale-[.97] disabled:cursor-not-allowed disabled:bg-[#9aaca6]"
            >
              <Plus size={16} /> {isSoldOut ? "مكتملة" : "احجز"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export const EventCard = memo(EventCardComponent);
