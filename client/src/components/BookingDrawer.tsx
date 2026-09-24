/**
 * فلسفة التصميم: ردهة المعهد الدافئة — درج حجوزات سياقي من الحافة، بحركة قصيرة وخيارات واضحة.
 */
import { events } from "@/data/events";
import { useBookings } from "@/contexts/BookingContext";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useEffect } from "react";
import { Link } from "wouter";

export function BookingDrawer() {
  const { bookings, clearBookings, decreaseBooking, drawerOpen, removeBooking, reserveEvent, setDrawerOpen } = useBookings();

  // willUnmount: يُزال مستمع Escape تلقائيًا عند إغلاق الدرج أو إزالة المكوّن.
  useEffect(() => {
    if (!drawerOpen) return;
    const handleEscape = (event: KeyboardEvent) => event.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [drawerOpen, setDrawerOpen]);

  return (
    <>
      <button aria-label="إغلاق خلفية الحجوزات" onClick={() => setDrawerOpen(false)} className={`fixed inset-0 z-50 bg-[#102b2a]/35 backdrop-blur-[2px] transition-opacity ${drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"}`} />
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-full max-w-[430px] flex-col bg-[color:var(--surface)] shadow-2xl transition-transform duration-240 ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`} aria-label="لوحة حجوزاتي">
        <div className="flex items-center justify-between border-b border-[#e6ddcf] px-6 py-6">
          <div>
            <p className="text-xs font-bold tracking-[0.15em] text-[#c55632]">قائمة حضورك</p>
            <h2 className="mt-1 font-display text-xl font-extrabold text-[#123D3A]">حجوزاتي</h2>
          </div>
          <button onClick={() => setDrawerOpen(false)} className="grid h-10 w-10 place-items-center border border-[#ded4c5] text-[#123D3A] transition hover:bg-[#f4eee4] active:scale-[.97]" aria-label="إغلاق"><X size={19} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {bookings.length === 0 ? (
            <div className="mt-16 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#f4eee4] font-display text-2xl text-[#c55632]">و</div>
              <h3 className="mt-5 font-display text-lg font-bold text-[#123D3A]">لم تختر ورشة بعد</h3>
              <p className="mt-2 text-sm leading-7 text-[#65716c]">اختر فعالية من البرنامج، وستحفظ هنا حتى بعد تحديث الصفحة.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const event = events.find((item) => item.id === booking.eventId);
                if (!event) return null;
                const remaining = event.seats - event.reserved - booking.seats;
                return (
                  <div key={booking.eventId} className="border border-[#e5dccd] p-4">
                    <div className="flex gap-3">
                      <img src={event.image} alt="" className="h-16 w-16 object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-[#c55632]">{event.weekday} · {event.time}</p>
                        <h3 className="mt-1 font-display text-sm font-bold leading-6 text-[#123D3A]">{event.title}</h3>
                        <p className="mt-1 text-xs text-[#65716c]">تبقى {Math.max(0, remaining)} مقاعد خارج اختيارك</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-[#ece4d8] pt-3">
                      <div className="flex items-center border border-[#ded4c5]">
                        <button onClick={() => decreaseBooking(event.id)} className="grid h-8 w-8 place-items-center text-[#123D3A] hover:bg-[#f4eee4]" aria-label="تقليل مقعد"><Minus size={14} /></button>
                        <span className="grid h-8 min-w-8 place-items-center text-sm font-bold text-[#123D3A]">{booking.seats}</span>
                        <button onClick={() => reserveEvent(event)} disabled={remaining <= 0} className="grid h-8 w-8 place-items-center text-[#123D3A] hover:bg-[#f4eee4] disabled:text-[#b4b4ad]" aria-label="زيادة مقعد"><Plus size={14} /></button>
                      </div>
                      <button onClick={() => removeBooking(event.id)} className="inline-flex items-center gap-1 text-xs font-bold text-[#9b4830] hover:text-[#6d261a]"><Trash2 size={14} /> إزالة</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-[#e6ddcf] p-6">
          {bookings.length > 0 ? <button onClick={clearBookings} className="mb-3 w-full py-2 text-sm font-bold text-[#9b4830] underline underline-offset-4">إفراغ القائمة</button> : null}
          <Link href="/bookings" onClick={() => setDrawerOpen(false)} className="block bg-[#123D3A] py-3 text-center text-sm font-bold text-white no-underline transition hover:bg-[#0b2e2c]">مراجعة ملخص الحجوزات</Link>
        </div>
      </aside>
    </>
  );
}
