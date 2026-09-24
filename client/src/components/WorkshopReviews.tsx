/**
 * فلسفة التصميم: لا توجد تقييمات تجريبية؛ يعرض هذا المكوّن الآراء المنشورة فعليًا فقط ويؤهل النشر بعد حجز مكتمل.
 */
import { trpc } from "@/lib/trpc";
import { MessageSquareText, Send, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function WorkshopReviews({ eventId, eligibleBookingId }: { eventId: string; eligibleBookingId?: number }) {
  const { data: reviews = [], isLoading } = trpc.reviews.listByEvent.useQuery({ eventId });
  const utils = trpc.useUtils();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const addReview = trpc.reviews.create.useMutation({ onSuccess: async () => { await utils.reviews.listByEvent.invalidate({ eventId }); await utils.reviews.mine.invalidate(); setRating(0); setComment(""); toast.success("نُشر تقييمك بعد التحقق من الحجز المكتمل."); }, onError: (error) => toast.error(error.message || "تعذر نشر التقييم.") });
  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

  return <section className="border-t border-[#dfd5c4] bg-[#f7f1e7] p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] font-bold tracking-[.14em] text-[#b85b3b]">آراء من حضور مكتمل</p><h3 className="mt-1 font-display text-base font-extrabold">كيف كانت التجربة؟</h3></div>{reviews.length > 0 && <div className="inline-flex items-center gap-1 bg-white px-3 py-2 text-sm font-bold text-[#123D3A]"><Star size={15} className="fill-[#e56a3d] text-[#e56a3d]" /> {average.toFixed(1)} <span className="mr-1 text-xs font-medium text-[#64746d]">من {reviews.length}</span></div>}</div>
    {isLoading ? <p className="mt-4 text-sm text-[#63736c]">يجري تحميل الآراء…</p> : reviews.length === 0 ? <p className="mt-5 flex items-center gap-2 text-sm leading-7 text-[#63736c]"><MessageSquareText size={17} className="text-[#c55632]" /> لا توجد آراء منشورة لهذه الورشة بعد.</p> : <div className="mt-5 space-y-3">{reviews.map((review) => <article key={review.id} className="border-r-2 border-[#e56a3d] bg-white px-4 py-3"><div className="flex items-center justify-between"><span className="text-xs font-bold text-[#123D3A]">{review.reviewerName || "مشارك موثّق"}</span><span className="inline-flex gap-0.5">{Array.from({ length: 5 }).map((_, index) => <Star key={index} size={13} className={index < review.rating ? "fill-[#e56a3d] text-[#e56a3d]" : "text-[#d8cdbd]"} />)}</span></div><p className="mt-2 text-sm leading-7 text-[#596a63]">{review.comment}</p></article>)}</div>}
    {eligibleBookingId ? <div className="mt-6 border-t border-[#dfd5c4] pt-5"><p className="text-xs font-bold text-[#123D3A]">اكتب رأيك، لأن حجزك لهذه الورشة مكتمل.</p><div className="mt-3 flex gap-1" aria-label="اختر التقييم">{[1, 2, 3, 4, 5].map((value) => <button key={value} onClick={() => setRating(value)} className="p-1" aria-label={`${value} نجوم`}><Star size={22} className={value <= rating ? "fill-[#e56a3d] text-[#e56a3d]" : "text-[#cfc3b0]"} /></button>)}</div><textarea value={comment} onChange={(event) => setComment(event.target.value)} className="mt-3 min-h-24 w-full border border-[#d8cbb8] bg-white p-3 text-sm leading-7 outline-none focus:border-[#123D3A]" placeholder="شارك ما كان مفيدًا في التجربة…" maxLength={1000} /><button onClick={() => { if (!rating || comment.trim().length < 8) return toast.error("اختر تقييمًا واكتب تعليقًا من 8 أحرف على الأقل."); addReview.mutate({ bookingId: eligibleBookingId, rating, comment: comment.trim() }); }} disabled={addReview.isPending} className="mt-3 inline-flex items-center gap-2 bg-[#123D3A] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"><Send size={15} /> {addReview.isPending ? "يجري النشر…" : "نشر التقييم"}</button></div> : <p className="mt-5 text-xs leading-6 text-[#6d7c75]">يمكن للحضور إضافة تقييم بعد أن تصبح حالة حجزهم «مكتمل».</p>}
  </section>;
}
