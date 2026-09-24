/**
 * فلسفة التصميم: ردهة المعهد الدافئة — صفحة برنامج تحريرية غير متناظرة، دافئة وواضحة ببيانات الحجز.
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { BookingWizard } from "@/components/BookingWizard";
import { EventCard } from "@/components/EventCard";
import { TopNav } from "@/components/TopNav";
import { WorkshopReviews } from "@/components/WorkshopReviews";
import { toDisplayEvent } from "@/lib/eventAdapter";
import { trpc } from "@/lib/trpc";
import type { Event, EventCategory } from "@/types/event";
import { ArrowLeft, CalendarRange, Search, SlidersHorizontal, UsersRound } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { toast } from "sonner";
import { useLocation } from "wouter";

const heroUrl = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=85";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: userBookings = [] } = trpc.bookings.mine.useQuery(undefined, { enabled: isAuthenticated });
  const { data: managedEvents = [], isLoading: programLoading } = trpc.events.published.useQuery();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<EventCategory | "الكل">("الكل");
  const [selectedDay, setSelectedDay] = useState("الكل");
  const [preview, setPreview] = useState<Event | null>(null);
  const [wizardEvent, setWizardEvent] = useState<Event | null>(null);
  const programEvents = useMemo(() => managedEvents.map(toDisplayEvent), [managedEvents]);
  const categories = useMemo(() => ["الكل", ...Array.from(new Set(programEvents.map((event) => event.category)))] as Array<EventCategory | "الكل">, [programEvents]);
  const days = useMemo(() => ["الكل", ...Array.from(new Set(programEvents.map((event) => event.weekday)))], [programEvents]);

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return programEvents.filter((event) => {
      const matchesQuery = !normalizedQuery || [event.title, event.instructor, event.category].join(" ").toLowerCase().includes(normalizedQuery);
      const matchesCategory = category === "الكل" || event.category === category;
      const matchesDay = selectedDay === "الكل" || event.weekday === selectedDay;
      return matchesQuery && matchesCategory && matchesDay;
    });
  }, [category, programEvents, query, selectedDay]);

  const bookingCount = userBookings.reduce((total, booking) => total + booking.seats, 0);
  const handleReserve = useCallback((event: Event) => {
    if (!isAuthenticated) {
      toast.message("سجّل الدخول أولًا لحفظ حجزك في ملفك الشخصي.");
      startLogin();
      return;
    }
    if (event.seats - event.reserved <= 0) {
      toast.error("لا توجد مقاعد متاحة لهذه الفعالية.");
      return;
    }
    setWizardEvent(event);
  }, [isAuthenticated]);

  const scrollToProgram = useCallback(() => document.getElementById("program")?.scrollIntoView({ behavior: "smooth" }), []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[color:var(--paper)] text-[#123D3A]">
      <TopNav />
      <main>
        <section className="relative border-b border-[#ded4c5] px-4 pb-10 pt-8 sm:px-8 lg:px-12 lg:pb-0 lg:pt-12">
          <div className="mx-auto grid max-w-[1440px] overflow-hidden border border-[#ded4c5] bg-[#f6f1e7] lg:grid-cols-[.98fr_1.02fr]">
            <div className="order-2 flex flex-col justify-between p-7 sm:p-10 lg:order-1 lg:p-14 xl:p-18">
              <div>
                <div className="mb-7 inline-flex items-center gap-2 border border-[#d7c9b7] bg-[#fbf7ee] px-3 py-2 text-xs font-bold text-[#5e716a]">
                  <span className="h-2 w-2 rounded-full bg-[#e56a3d]" /> برنامج سبتمبر 2026
                </div>
                <h1 className="max-w-2xl font-display text-[34px] font-extrabold leading-[1.7] tracking-[-.04em] text-[#123D3A] sm:text-5xl xl:text-6xl">اختر ورشة، ثم اترك للمحادثة أن تبدأ.</h1>
                <p className="mt-6 max-w-xl text-base leading-9 text-[#52645e]">تجارب صغيرة في الحِرف والتصميم والتقنية والتصوير. عدد مقاعد قليل، ومدربون يعرفون أن أفضل تعلّم يبدأ بسؤال جيد.</p>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <button onClick={scrollToProgram} className="inline-flex items-center gap-2 bg-[#123D3A] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#0b2e2c] active:scale-[.97]">استكشف البرنامج <ArrowLeft size={17} /></button>
                <button onClick={() => isAuthenticated ? setLocation("/profile") : startLogin()} className="inline-flex items-center gap-2 border border-[#b8c7bd] bg-transparent px-5 py-3.5 text-sm font-bold text-[#123D3A] transition hover:bg-[#e8eee8] active:scale-[.97]"><UsersRound size={17} /> لديك {bookingCount} {bookingCount === 1 ? "مقعد" : "مقاعد"} محفوظة</button>
              </div>
            </div>
            <div className="relative order-1 min-h-[330px] lg:order-2 lg:min-h-[560px]">
              <img src={heroUrl} alt="تعاون متعلمين في ورشة إبداعية" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#123D3A]/35 via-transparent to-transparent" />
              <div className="absolute bottom-0 right-0 flex items-center gap-3 bg-[#123D3A] px-6 py-4 text-[#fbf7ee] sm:px-8"><CalendarRange size={20} /><p className="text-sm font-bold">12 تجربة · 4 مجالات · شهر كامل</p></div>
            </div>
          </div>
          <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 border-x border-[#ded4c5] px-5 py-4 text-xs font-bold text-[#5c6d67] sm:px-8">
            <span className="inline-flex items-center gap-2"><span className="h-2 w-2 bg-[#e56a3d]" /> حضور محدود لكي يبقى الحوار قريبًا.</span>
            <span className="hidden sm:inline">حجوزاتك تُحفظ على جهازك تلقائيًا</span>
          </div>
        </section>

        <section id="program" className="px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="mx-auto max-w-[1280px]">
            <div className="grid gap-8 lg:grid-cols-[.68fr_1.32fr] lg:items-end">
              <div>
                <p className="text-xs font-bold tracking-[0.18em] text-[#b85b3b]">برنامج هذا الشهر</p>
                <h2 className="mt-4 font-display text-3xl font-extrabold leading-[1.65] text-[#123D3A] sm:text-4xl">ابحث عن شيء تريد أن تجرّبه بيدك.</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <label className="flex h-12 items-center gap-3 border border-[#d9cfbf] bg-[color:var(--surface)] px-4 focus-within:border-[#123D3A]">
                  <Search size={18} className="shrink-0 text-[#c55632]" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث بالعنوان أو المدرب أو المجال" className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-[#94a097]" />
                </label>
                <div className="flex h-12 items-center gap-2 border border-[#d9cfbf] bg-[color:var(--surface)] px-4 text-xs font-bold text-[#53635d]"><SlidersHorizontal size={16} className="text-[#c55632]" /> {filteredEvents.length} فعاليات ظاهرة</div>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-2 border-b border-[#e1d7c7] pb-5">
              {categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`clip-paper px-4 py-2 text-sm font-bold transition ${category === item ? "bg-[#123D3A] text-white" : "border border-[#d9cfbf] text-[#52645e] hover:border-[#123D3A] hover:text-[#123D3A]"}`}>{item}</button>)}
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-bold text-[#596a63]">
              <span className="ml-1">اختر اليوم:</span>
              {days.map((day) => <button key={day} onClick={() => setSelectedDay(day)} className={`border-b-2 px-2 py-1.5 transition ${selectedDay === day ? "border-[#e56a3d] text-[#123D3A]" : "border-transparent hover:border-[#dbcbb5]"}`}>{day}</button>)}
            </div>

            {programLoading ? <div className="mt-10 border border-dashed border-[#cfc2ae] bg-[#f8f3ea] py-18 text-center"><p className="font-display text-xl font-bold text-[#123D3A]">يجري ترتيب البرنامج…</p></div> : filteredEvents.length > 0 ? (
              <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-12">
                {filteredEvents.map((event, index) => <EventCard key={event.id} event={event} featured={index === 0} className={index === 0 ? "md:col-span-2 xl:col-span-6" : "xl:col-span-3"} selectedSeats={0} onReserve={handleReserve} onPreview={setPreview} />)}
              </div>
            ) : (
              <div className="mt-10 border border-dashed border-[#cfc2ae] bg-[#f8f3ea] py-18 text-center">
                <p className="font-display text-xl font-bold text-[#123D3A]">لا توجد فعالية تطابق اختيارك.</p>
                <button onClick={() => { setQuery(""); setCategory("الكل"); setSelectedDay("الكل"); }} className="mt-4 text-sm font-bold text-[#b54e2c] underline underline-offset-4">إعادة ضبط البحث</button>
              </div>
            )}
          </div>
        </section>
      </main>
      <footer className="bg-[#123D3A] px-4 py-10 text-[#e8ede9] sm:px-8 lg:px-12"><div className="mx-auto flex max-w-[1280px] flex-col justify-between gap-5 text-sm sm:flex-row sm:items-end"><p className="font-display text-lg font-bold">ورشة — مكان صغير لما يستحق أن يُجرَّب.</p><p className="text-xs leading-6 text-[#b7c8bd]">تُحفظ الحجوزات ضمن ملف الحضور، وتُتاح التقييمات بعد اكتمال التجربة.</p></div></footer>

      <Modal show={preview !== null} onHide={() => setPreview(null)} centered>
        {preview && <><Modal.Header closeButton><Modal.Title className="font-display text-lg font-extrabold text-[#123D3A]">{preview.title}</Modal.Title></Modal.Header><Modal.Body className="p-0"><img src={preview.image} alt="" className="h-48 w-full object-cover" /><div className="p-5"><p className="text-sm leading-8 text-[#51645e]">{preview.shortDescription}</p><div className="mt-5 grid grid-cols-2 gap-3 text-xs text-[#53635d]"><span>المدرب: <b>{preview.instructor}</b></span><span>المستوى: <b>{preview.level}</b></span><span>المكان: <b>{preview.venue}</b></span><span>الوقت: <b>{preview.time}</b></span></div></div><WorkshopReviews eventId={preview.id} /></Modal.Body><Modal.Footer><button onClick={() => setPreview(null)} className="border border-[#d9cfbf] px-4 py-2 text-sm font-bold text-[#123D3A]">إغلاق</button><button onClick={() => { handleReserve(preview); setPreview(null); }} className="bg-[#123D3A] px-4 py-2 text-sm font-bold text-white">أضف إلى حجوزاتي</button></Modal.Footer></>}
      </Modal>
      <BookingWizard event={wizardEvent} user={user} onClose={() => setWizardEvent(null)} />
    </div>
  );
}
