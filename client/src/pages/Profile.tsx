/**
 * فلسفة التصميم: سجل شخصي يشبه قصاصة برنامج، يجمع الموعد القادم والذاكرة والإشعارات في مسار واحد.
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { BrandMark } from "@/components/BrandMark";
import { TopNav } from "@/components/TopNav";
import { WorkshopReviews } from "@/components/WorkshopReviews";
import { toDisplayEvent } from "@/lib/eventAdapter";
import { trpc } from "@/lib/trpc";
import { Bell, CalendarDays, Clock3, LogIn, MapPin, Search, SlidersHorizontal, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";

const labels = { pending: "بانتظار التأكيد", confirmed: "مؤكد", completed: "مكتمل", cancelled: "ملغى" } as const;

export default function Profile() {
  const { user, isAuthenticated, loading } = useAuth();
  const { data: bookings = [], isLoading } = trpc.bookings.mine.useQuery(undefined, { enabled: isAuthenticated });
  const { data: notifications = [] } = trpc.notifications.mine.useQuery(undefined, { enabled: isAuthenticated });
  const utils = trpc.useUtils();
  const cancelBooking = trpc.bookings.cancel.useMutation({ onSuccess: () => utils.bookings.mine.invalidate() });
  const completeBooking = trpc.bookings.completeForAdmin.useMutation({ onSuccess: () => utils.bookings.mine.invalidate() });
  const markRead = trpc.notifications.markRead.useMutation({ onSuccess: () => utils.notifications.mine.invalidate() });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const [sort, setSort] = useState<"nearest" | "newest" | "seats">("nearest");

  const bookingRows = useMemo(() => bookings.map((booking) => {
    const event = booking.eventTitle ? toDisplayEvent({ id: booking.eventId, title: booking.eventTitle, description: booking.eventDescription ?? "تفاصيل الفعالية محفوظة في سجل ورشة.", category: booking.eventCategory ?? "فعاليات", startAt: booking.eventStartAt ?? booking.createdAt, durationMinutes: booking.eventDurationMinutes ?? 120, venue: booking.eventVenue ?? "قاعة ورشة", instructor: booking.eventInstructor ?? "فريق ورشة", level: booking.eventLevel ?? "مفتوح للجميع", capacity: booking.eventCapacity ?? booking.seats, imageUrl: booking.eventImageUrl ?? "", accent: booking.eventAccent ?? "#E56A3D", reserved: 0 }) : undefined;
    return { booking, catalogEntry: event ? { event, startAt: booking.eventStartAt ?? booking.createdAt } : undefined };
  }), [bookings]);
  const filteredRows = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    const rows = bookingRows.filter(({ booking, catalogEntry }) => {
      const bucket = booking.status === "pending" || booking.status === "confirmed" ? "upcoming" : "past";
      const text = [catalogEntry?.event.title, catalogEntry?.event.instructor, catalogEntry?.event.category, booking.eventId].join(" ").toLowerCase();
      return (filter === "all" || bucket === filter) && (!normalized || text.includes(normalized));
    });
    return [...rows].sort((left, right) => {
      if (sort === "seats") return right.booking.seats - left.booking.seats;
      if (sort === "newest") return new Date(right.booking.createdAt).getTime() - new Date(left.booking.createdAt).getTime();
      return new Date(left.catalogEntry?.startAt ?? left.booking.createdAt).getTime() - new Date(right.catalogEntry?.startAt ?? right.booking.createdAt).getTime();
    });
  }, [bookingRows, filter, search, sort]);
  const upcoming = filteredRows.filter(({ booking }) => booking.status === "pending" || booking.status === "confirmed");
  const past = filteredRows.filter(({ booking }) => booking.status === "completed" || booking.status === "cancelled");
  const unreadCount = notifications.filter((notification) => !notification.readAt).length;
  const isAdmin = user?.role === "admin";

  if (loading) return <div className="min-h-screen bg-[color:var(--paper)]" dir="rtl"><TopNav /><main className="mx-auto max-w-5xl px-5 py-24 text-center text-sm text-[#61726a]">يجري تجهيز ملفك…</main></div>;
  if (!user) return <div className="min-h-screen bg-[color:var(--paper)]" dir="rtl"><TopNav /><main className="mx-auto max-w-3xl px-5 py-20"><section className="paper-slip border border-[#d9cbb7] bg-[#f7f1e7] p-8 sm:p-12"><UserRound className="text-[#c55632]" size={34} /><p className="mt-6 text-xs font-bold tracking-[.15em] text-[#b85b3b]">ملف الحضور</p><h1 className="mt-3 font-display text-3xl font-extrabold text-[#123D3A]">سجّل دخولك لرؤية برنامجك الشخصي.</h1><p className="mt-4 max-w-lg text-sm leading-8 text-[#5e6f68]">ستظهر هنا حجوزاتك الحالية وسجل ورشك المكتملة، ويمكنك إضافة تقييم حقيقي بعد انتهاء الحضور.</p><button onClick={startLogin} className="mt-7 inline-flex items-center gap-2 bg-[#123D3A] px-5 py-3 text-sm font-bold text-white"><LogIn size={16} /> تسجيل الدخول</button></section></main></div>;

  function BookingTile({ row }: { row: typeof filteredRows[number] }) {
    const { booking, catalogEntry } = row;
    const event = catalogEntry?.event;
    return <article className="grid grid-cols-[100px_1fr] gap-4 border border-[#ded3c2] bg-[color:var(--surface)] p-4"><img src={event?.image} alt="" className="h-27 w-25 object-cover" /><div><div className="flex items-start justify-between gap-3"><div><span className={`text-xs font-bold ${booking.status === "completed" ? "text-[#27805b]" : booking.status === "cancelled" ? "text-[#a44d32]" : "text-[#b85534]"}`}>{labels[booking.status]}</span><h3 className="mt-2 font-display text-lg font-extrabold text-[#123D3A]">{event?.title ?? booking.eventId}</h3></div>{booking.status === "confirmed" && <div className="flex items-center gap-3"><button onClick={() => cancelBooking.mutate({ bookingId: booking.id })} disabled={cancelBooking.isPending} className="text-xs font-bold text-[#a44d32] underline underline-offset-4 disabled:opacity-50">إلغاء</button>{isAdmin && <button onClick={() => completeBooking.mutate({ bookingId: booking.id })} disabled={completeBooking.isPending} className="text-xs font-bold text-[#27805b] underline underline-offset-4 disabled:opacity-50">إتمام كمسؤول</button>}</div>}</div><p className="mt-3 flex items-center gap-2 text-xs text-[#60716a]"><CalendarDays size={14} /> {event?.date ?? "سيتم تحديد الموعد"} · {event?.time}</p><p className="mt-2 flex items-center gap-2 text-xs text-[#60716a]"><MapPin size={14} /> {event?.venue ?? "قاعة ورشة"} · {booking.seats} مقعد</p></div></article>;
  }

  return <div className="min-h-screen bg-[color:var(--paper)]" dir="rtl"><TopNav /><main className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:py-18"><header className="relative overflow-hidden border border-[#d9cdbc] bg-[#f7f1e7] p-7 sm:p-10"><BrandMark className="absolute -left-7 -top-7 h-36 w-36 rotate-[9deg] text-[#123D3A]/10" /><div className="relative"><p className="text-xs font-bold tracking-[.16em] text-[#b85b3b]">ملف الحضور الشخصي · قصاصة برنامجك</p><div className="mt-4 flex flex-wrap items-end justify-between gap-5"><div><h1 className="font-display text-4xl font-extrabold text-[#123D3A]">مرحبًا، {user.name || "مشارك ورشة"}.</h1><p className="mt-3 text-sm text-[#5f7069]">هنا تتجمع اللقاءات التي اخترتها، وما يمكن أن تترك له أثرًا بعد اكتماله.</p></div><div className="stamp-outline !h-[84px] !w-[84px] text-[8px]"><span>{bookings.length}<br />حجوزات<br />محفوظة</span></div></div></div></header>

    <section id="notifications" className="paper-slip mt-6 border border-[#d9cbb7] bg-[#fbf7ee] p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-[#123D3A] text-white"><Bell size={18} /></div><div><p className="font-display text-base font-extrabold">مركز الرسائل</p><p className="mt-1 text-xs text-[#60716a]">{unreadCount ? `${unreadCount} رسائل جديدة بانتظارك.` : "كل رسائلك مقروءة الآن."}</p></div></div>{unreadCount > 0 && <button onClick={() => markRead.mutate()} disabled={markRead.isPending} className="text-xs font-bold text-[#123D3A] underline underline-offset-4">تحديد الكل كمقروء</button>}</div>{notifications.length > 0 && <div className="mt-4 divide-y divide-[#e6dccd] border-t border-[#e6dccd]">{notifications.slice(0, 3).map((notification) => <article key={notification.id} className="py-3"><p className="text-sm font-bold text-[#123D3A]">{notification.title}</p><p className="mt-1 text-xs leading-6 text-[#61726a]">{notification.body}</p></article>)}</div>}</section>

    <section className="mt-8 border-y border-[#dfd3c1] py-5"><div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]"><label className="flex h-12 items-center gap-3 border border-[#d9cfbf] bg-[color:var(--surface)] px-4 focus-within:border-[#123D3A]"><Search size={18} className="text-[#c55632]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث في عناوين ورشك أو مجالاتها" className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-[#94a097]" /></label><label className="flex h-12 items-center gap-2 border border-[#d9cfbf] bg-[color:var(--surface)] px-3 text-xs font-bold"><SlidersHorizontal size={16} className="text-[#c55632]" /><select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)} className="bg-transparent outline-none"><option value="all">كل الحجوزات</option><option value="upcoming">الحالية</option><option value="past">السابقة</option></select></label><label className="flex h-12 items-center gap-2 border border-[#d9cfbf] bg-[color:var(--surface)] px-3 text-xs font-bold"><span>ترتيب:</span><select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className="bg-transparent outline-none"><option value="nearest">الأقرب موعدًا</option><option value="newest">الأحدث حجزًا</option><option value="seats">عدد المقاعد</option></select></label></div></section>
    <section className="mt-10"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold tracking-[.14em] text-[#b85b3b]">الآن وما بعده</p><h2 className="mt-2 font-display text-2xl font-extrabold">حجوزاتك الحالية</h2></div><Link href="/" className="brand-link text-sm font-bold underline underline-offset-4">اكتشف ورشة أخرى</Link></div>{isLoading ? <p className="mt-5 text-sm text-[#65756e]">يجري تحميل حجوزاتك…</p> : upcoming.length === 0 ? <div className="paper-slip mt-5 flex flex-col gap-5 border border-dashed border-[#d6c7b3] bg-[#faf5ec] p-6 sm:flex-row sm:items-center"><div className="stamp-outline !h-[72px] !w-[72px] text-[7px]"><span>لا يوجد<br />موعد<br />بعد</span></div><div><p className="font-display text-lg font-bold text-[#123D3A]">لا يوجد موعد مؤكّد يطابق اختيارك.</p><p className="mt-2 text-sm leading-7 text-[#617169]">غيّر الفلاتر أو اختر لقاءً صغيرًا من البرنامج ليبدأ أثره هنا.</p></div></div> : <div className="mt-5 grid gap-4 lg:grid-cols-2">{upcoming.map((row) => <BookingTile key={row.booking.id} row={row} />)}</div>}</section>
    <section className="mt-14 pb-12"><p className="text-xs font-bold tracking-[.14em] text-[#b85b3b]">الذاكرة والتقييم</p><h2 className="mt-2 font-display text-2xl font-extrabold">الحجوزات السابقة</h2>{past.length === 0 ? <div className="paper-slip mt-5 flex gap-5 border-r-2 border-[#e56a3d] bg-[#edf2ed] p-6"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#b7cfbe] text-[#c55632]"><Clock3 size={18} /></div><p className="text-sm leading-7 text-[#5a6d64]">بعد انتهاء أول ورشة وحصول حجزك على حالة «مكتمل»، ستظهر هنا كقصاصة لقاء مكتمل مع مساحة دافئة لإضافة تقييمك.</p></div> : <div className="mt-5 space-y-5">{past.map((row) => <article key={row.booking.id} className="border border-[#ded3c2] bg-[color:var(--surface)]"><BookingTile row={row} />{row.booking.status === "completed" && <WorkshopReviews eventId={row.booking.eventId} eligibleBookingId={row.booking.id} />}</article>)}</div>}</section>
  </main></div>;
}
