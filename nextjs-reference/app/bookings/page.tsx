import { BookingForm } from "./BookingForm";

export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ eventId?: string }> }) {
  const { eventId } = await searchParams;
  return (
    <main>
      <p className="eyebrow">Server Action + useActionState</p>
      <h1>اطلب مقعدك.</h1>
      <p className="muted">هذا نموذج Next.js تعليمي: تتحقق Form Action من البيانات على الخادم، لكنه لا يسجل بيانات حقيقية حتى تضيف قاعدة بيانات ومصادقة.</p>
      <BookingForm selectedEventId={eventId ?? "ceramics-forms"} />
    </main>
  );
}
