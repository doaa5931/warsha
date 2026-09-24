# مرجع Next.js لمنصة «ورشة»

هذا مجلد مستقل قابل للتشغيل يركز على الجزء الذي لا ينفذ داخل Vite SPA: **App Router، مكونات الخادم والعميل، المسارات الديناميكية، Route Handlers، Form Actions، caching، وتحسين الصور**.

## التشغيل

```bash
cd nextjs-reference
npm install
npm run dev
```

افتح `http://localhost:3000`. استخدم `npm run build` للتحقق من بناء الإنتاج.

## خريطة الملفات

| الملف | المفهوم الذي يطبقه |
|---|---|
| `app/page.tsx` | Server Component وApp Router وجلب مصدر البيانات الخادمي |
| `components/ClientSearch.tsx` | Client Component مع `useState` و`useMemo` |
| `app/events/[id]/page.tsx` | مسار ديناميكي وNull Safety عبر `notFound()` |
| `app/api/events/route.ts` | Route Handler لـ `GET` و`POST` |
| `app/bookings/actions.ts` | Server-side Form Action والتحقق من القيم |
| `app/bookings/BookingForm.tsx` | `useActionState` و`useRef` وeffect للتعامل مع النموذج |
| `lib/events.ts` | Caching/ISR بـ `unstable_cache` و`revalidate` |
| `legacy-pages-reference/events/[id].tsx` | مقارنة Pages Router القديم مع App Router؛ ملف مرجعي ولا يشغل بجانبه |
| `next.config.ts` | ضبط نطاق صور Unsplash لـ `next/image` |

## استراتيجيات العرض

| الحالة | المثال في المشروع | الاستراتيجية |
|---|---|---|
| برنامج فعاليات مشترك | `app/page.tsx` + `getEvents()` | Server Rendering مع caching لمدة ساعة |
| صفحة تفاصيل فعالية | `app/events/[id]/page.tsx` | مسار ديناميكي، يمكن إعادة التحقق كل ساعة من مصدر البيانات |
| بحث أثناء الكتابة | `ClientSearch.tsx` | Client Component لأنه يعتمد على حالة وأحداث المتصفح |
| تأكيد الحجز | `BookingForm.tsx` | Form Action على الخادم مع رسالة حالة على العميل |

> لا تضف API Routes القديمة وRoute Handlers في المسار ذاته. مع App Router، تستخدم Route Handlers داخل ملفات `route.ts`. [1]

## المراجع

[1]: https://nextjs.org/docs/app/getting-started/route-handlers "Next.js — Route Handlers"
[2]: https://nextjs.org/docs/app "Next.js — App Router"
[3]: https://nextjs.org/docs/app/getting-started/fetching-data "Next.js — Fetching Data"
