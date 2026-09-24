/**
 * فلسفة التصميم: ردهة المعهد الدافئة — الحجز رحلة قصيرة بثلاث محطات بدل نموذج طويل ومربك.
 */
import { trpc } from "@/lib/trpc";
import type { Event } from "@/types/event";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, CircleCheck, Mail, Minus, Plus, UserRound, X } from "lucide-react";
import { useMemo, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { toast } from "sonner";

type BookingWizardProps = {
  event: Event | null;
  user: { name?: string | null; email?: string | null } | null;
  onClose: () => void;
};

const stepCopy = ["اختيار المقاعد", "بيانات الحضور", "تأكيد الطلب"];

export function BookingWizard({ event, user, onClose }: BookingWizardProps) {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [seats, setSeats] = useState(1);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const utils = trpc.useUtils();
  const createBooking = trpc.bookings.create.useMutation({
    onSuccess: async () => {
      await utils.bookings.mine.invalidate();
      await utils.notifications.mine.invalidate();
      toast.success("تم تأكيد طلبك وحفظه في ملفك الشخصي.");
      onClose();
      setStep(0);
      setSeats(1);
    },
    onError: (error) => toast.error(error.message || "تعذر حفظ الحجز، حاول مرة أخرى."),
  });

  const remaining = useMemo(() => event ? event.seats - event.reserved : 0, [event]);
  const detailsValid = name.trim().length >= 2 && /\S+@\S+\.\S+/.test(email);

  function close() {
    if (!createBooking.isPending) onClose();
  }

  function confirm() {
    if (!event || !detailsValid) return;
    createBooking.mutate({ eventId: event.id, attendeeName: name.trim(), attendeeEmail: email.trim(), seats });
  }

  return (
    <Modal show={event !== null} onHide={close} centered contentClassName="border-0 rounded-none overflow-hidden" dialogClassName="max-w-[680px]" aria-label="نموذج الحجز متعدد الخطوات">
      {event && <div dir="rtl" className="bg-[color:var(--paper)] text-[#123D3A]">
        <div className="flex items-center justify-between border-b border-[#dfd5c4] px-5 py-4 sm:px-7">
          <div><p className="text-[10px] font-bold tracking-[.16em] text-[#b85b3b]">طلب حضور جديد</p><h2 className="mt-1 font-display text-base font-extrabold">{event.title}</h2></div>
          <button onClick={close} className="grid h-9 w-9 place-items-center border border-[#d8cbb9] transition hover:bg-[#f3ede2]" aria-label="إغلاق نموذج الحجز"><X size={18} /></button>
        </div>

        <div className="grid grid-cols-3 border-b border-[#dfd5c4] bg-[#f5efe5] px-5 sm:px-7">
          {stepCopy.map((label, index) => <div key={label} className={`relative py-3 text-center text-[10px] font-bold sm:text-xs ${index <= step ? "text-[#123D3A]" : "text-[#92a098]"}`}><span className={`mb-1 mx-auto grid h-5 w-5 place-items-center rounded-full text-[10px] ${index < step ? "bg-[#e56a3d] text-white" : index === step ? "bg-[#123D3A] text-white" : "border border-[#b9c8be]"}`}>{index < step ? <Check size={12} /> : index + 1}</span>{label}{index < 2 && <span className="absolute left-[-50%] top-5 hidden h-px w-full bg-[#d4c5b0] sm:block" />}</div>)}
        </div>

        <div className="min-h-[315px] px-5 py-7 sm:px-7">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: reduceMotion ? 1 : 0, x: reduceMotion ? 0 : 22 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: reduceMotion ? 1 : 0, x: reduceMotion ? 0 : -22 }} transition={reduceMotion ? { duration: 0 } : { duration: 0.2, ease: [0.23, 1, 0.32, 1] }}>
              {step === 0 && <section>
                <p className="text-xs font-bold tracking-[.15em] text-[#b85b3b]">المحطة الأولى</p><h3 className="mt-3 font-display text-xl font-extrabold">كم مقعدًا تريد أن تحجز؟</h3><p className="mt-2 text-sm leading-7 text-[#5c6d66]">يتوفر الآن {remaining} مقاعد. يمكنك إضافة حتى خمسة مقاعد في الطلب الواحد.</p>
                <div className="mt-7 flex items-center justify-between border-y border-[#dfd5c4] py-5"><div><p className="font-bold">{event.weekday} · {event.date} · {event.time}</p><p className="mt-1 text-xs text-[#63736c]">{event.venue}</p></div><div className="flex items-center border border-[#cdbda8]"><button onClick={() => setSeats((value) => Math.max(1, value - 1))} className="grid h-11 w-11 place-items-center hover:bg-[#efe7d9]" aria-label="تقليل عدد المقاعد"><Minus size={16} /></button><span className="grid h-11 min-w-11 place-items-center text-lg font-extrabold">{seats}</span><button onClick={() => setSeats((value) => Math.min(5, remaining, value + 1))} disabled={seats >= remaining || seats >= 5} className="grid h-11 w-11 place-items-center hover:bg-[#efe7d9] disabled:text-[#adb9b2]" aria-label="زيادة عدد المقاعد"><Plus size={16} /></button></div></div>
              </section>}
              {step === 1 && <section>
                <p className="text-xs font-bold tracking-[.15em] text-[#b85b3b]">المحطة الثانية</p><h3 className="mt-3 font-display text-xl font-extrabold">لمن نثبّت المقاعد؟</h3><p className="mt-2 text-sm leading-7 text-[#5c6d66]">نستخدم هذه البيانات لتأكيد الحجز داخل ملفك الشخصي فقط.</p>
                <div className="mt-6 grid gap-4"><label className="block"><span className="mb-2 inline-flex items-center gap-2 text-xs font-bold"><UserRound size={14} className="text-[#c55632]" /> الاسم الكامل</span><input value={name} onChange={(input) => setName(input.target.value)} className="w-full border border-[#d6cab9] bg-white px-4 py-3 text-sm outline-none focus:border-[#123D3A]" placeholder="مثال: ريم خالد" /></label><label className="block"><span className="mb-2 inline-flex items-center gap-2 text-xs font-bold"><Mail size={14} className="text-[#c55632]" /> البريد الإلكتروني</span><input type="email" value={email} onChange={(input) => setEmail(input.target.value)} className="w-full border border-[#d6cab9] bg-white px-4 py-3 text-sm outline-none focus:border-[#123D3A]" placeholder="name@example.com" /></label></div>
              </section>}
              {step === 2 && <section>
                <p className="text-xs font-bold tracking-[.15em] text-[#b85b3b]">المحطة الأخيرة</p><h3 className="mt-3 font-display text-xl font-extrabold">راجع طلبك قبل تأكيده.</h3><div className="mt-6 space-y-4 border-y border-[#dfd5c4] py-5 text-sm"><p className="flex justify-between gap-5"><span className="text-[#63736c]">الورشة</span><b>{event.title}</b></p><p className="flex justify-between gap-5"><span className="text-[#63736c]">الحضور</span><b>{name}</b></p><p className="flex justify-between gap-5"><span className="text-[#63736c]">عدد المقاعد</span><b>{seats}</b></p><p className="flex justify-between gap-5"><span className="text-[#63736c]">الموعد</span><b>{event.date} · {event.time}</b></p></div><p className="mt-5 inline-flex items-center gap-2 text-xs leading-6 text-[#4e675f]"><CircleCheck size={16} className="text-[#e56a3d]" /> سيظهر الحجز فورًا في صفحة ملفك الشخصي.</p>
              </section>}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between border-t border-[#dfd5c4] px-5 py-4 sm:px-7"><button onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0 || createBooking.isPending} className="inline-flex items-center gap-1.5 px-2 py-2 text-sm font-bold text-[#52655f] disabled:opacity-35"><ChevronRight size={17} /> السابق</button>{step < 2 ? <button onClick={() => step === 1 && !detailsValid ? toast.error("أدخل الاسم والبريد الإلكتروني بصورة صحيحة.") : setStep((value) => value + 1)} className="inline-flex items-center gap-1.5 bg-[#123D3A] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0b2e2c] active:scale-[.97]">التالي <ChevronLeft size={17} /></button> : <button onClick={confirm} disabled={createBooking.isPending} className="inline-flex items-center gap-2 bg-[#e56a3d] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#c7552d] disabled:opacity-60"><Check size={17} /> {createBooking.isPending ? "يُحفظ الطلب…" : "تأكيد الحجز"}</button>}</div>
      </div>}
    </Modal>
  );
}
