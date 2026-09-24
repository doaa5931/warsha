import { ClientSearch } from "@/components/ClientSearch";
import { getEvents } from "@/lib/events";

// Server Component: جلب البيانات من المصدر الخادمي مع caching في lib/events.ts.
export default async function HomePage() {
  const events = await getEvents();
  return (
    <main>
      <p className="eyebrow">App Router · Server Components · Cache</p>
      <h1>ورشة، في نسخة Next.js.</h1>
      <p className="muted">هذه الصفحة تُعرض على الخادم. مكوّن البحث وحده يعمل على العميل لأنه يحتاج حالة وإدخال المستخدم.</p>
      <ClientSearch initialEvents={events} />
    </main>
  );
}
