/**
 * فلسفة التصميم: ردهة المعهد الدافئة — صفحة ملخص هادئة توفر مخرجًا واضحًا للزائر ومسارًا لمراجعة اختياراته.
 */
import { TopNav } from "@/components/TopNav";
import { events } from "@/data/events";
import { useBookings } from "@/contexts/BookingContext";
import { ArrowRight, CalendarDays, MapPin, TicketCheck } from "lucide-react";
import { Link } from "wouter";

export default function MyBookings() {
  const { bookings, bookingCount, clearBookings, removeBooking } = useBookings();
  const totalAvailable = bookings.reduce((total, booking) => total + (events.find((event) => event.id === booking.eventId)?.seats ?? 0), 0);

  return (
    <div className="min-h-screen bg-[color:var(--paper)]" dir="rtl">
      <TopNav />
      <main className="mx-auto max-w-[1180px] px-4 py-12 sm:px-8 lg:py-20">
        <Link href="/" className="brand-link inline-flex items-center gap-2 text-sm font-bold text-[#52645e] no-underline transition hover:text-[#123D3A]"><ArrowRight size={17} /> العودة إلى البرنامج</Link>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_.75fr]">
          <section>
            <p className="text-xs font-bold tracking-[0.18em] text-[#b85b3b]">ملخص حضورك</p>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.6] text-[#123D3A]">قائمة التجارب التي اخترتها.</h1>
            {bookings.length === 0 ? <div className="paper-slip mt-10 border border-dashed border-[#d6cab8] bg-[#f7f1e7] p-7 sm:p-10"><div className="flex flex-col gap-8 sm:flex-row sm:items-center"><div className="stamp-outline"><TicketCheck className="text-[#c55632]" size={29} /><span>برنامجك<br />ينتظر</span></div><div className="flex-1"><p className="text-xs font-bold tracking-[0.15em] text-[#b45535]">ورقة الحضور الشخصية</p><h2 className="mt-3 font-display text-2xl font-bold text-[#123D3A]">القائمة ما زالت فارغة</h2><p className="mt-3 text-sm leading-7 text-[#5d6d66]">اختر ورشة واحدة على الأقل، وسيظهر هنا وقتها ومكانها ومقعدك المختار.</p><div className="mt-5 flex items-center gap-3 text-xs font-bold text-[#62726a]"><span className="timeline-dot" /> اختر تجربة <span className="timeline-line" /> احفظ مقعدك <span className="timeline-line" /> قابل من يشبه فضولك</div><Link href="/" className="mt-7 inline-block bg-[#123D3A] px-4 py-3 text-sm font-bold text-white no-underline">استكشف الفعاليات</Link></div></div></div> : <div className="mt-10 space-y-4">{bookings.map((booking) => { const event = events.find((item) => item.id === booking.eventId); return event ? <article key={booking.eventId} className="grid gap-4 border border-[#e1d7c8] bg-[color:var(--surface)] p-4 sm:grid-cols-[150px_1fr_auto]"><img src={event.image} alt="" className="h-32 w-full object-cover sm:h-full" /><div><p className="text-xs font-bold text-[#c55632]">{event.category} · {event.level}</p><h2 className="mt-2 font-display text-xl font-bold text-[#123D3A]">{event.title}</h2><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-[#5f6d68]"><span className="inline-flex items-center gap-1.5"><CalendarDays size={14} /> {event.weekday}، {event.date} · {event.time}</span><span className="inline-flex items-center gap-1.5"><MapPin size={14} /> {event.venue}</span></div></div><div className="flex flex-row items-start justify-between gap-4 sm:flex-col sm:items-end"><span className="border border-[#c8d7cd] bg-[#edf3ee] px-3 py-1.5 text-sm font-bold text-[#123D3A]">{booking.seats} {booking.seats === 1 ? "مقعد" : "مقاعد"}</span><button onClick={() => removeBooking(event.id)} className="text-xs font-bold text-[#a0472d] underline underline-offset-4">إزالة</button></div></article> : null; })}</div>}
          </section>
          <aside className="h-fit bg-[#123D3A] p-7 text-[#f6f3ea] lg:sticky lg:top-26"><p className="text-xs font-bold tracking-[0.16em] text-[#d1ded5]">بيانات سريعة</p><p className="mt-5 font-display text-5xl font-extrabold">{bookingCount}</p><p className="mt-1 text-sm text-[#d1ded5]">مقاعد مختارة الآن</p><div className="mt-8 border-t border-white/20 pt-5 text-sm leading-8 text-[#d1ded5]">تمثل القائمة تجربة state management محلية: تُحفظ اختياراتك عبر `useLocalStorage` وتدار أفعالها داخل `useReducer`.</div><p className="mt-4 text-xs text-[#d1ded5]/70">سعة ورشك المختارة: {totalAvailable} مقعدًا إجمالًا</p>{bookings.length > 0 && <button onClick={clearBookings} className="mt-8 w-full border border-white/30 py-3 text-sm font-bold text-white transition hover:bg-white/10">إفراغ القائمة</button>}</aside>
        </div>
      </main>
    </div>
  );
}
