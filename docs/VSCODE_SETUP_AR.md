# فتح مشروع ورشة وتشغيله في Visual Studio Code

## 1. المتطلبات

ثبّت **Node.js 22 LTS أو أحدث** وVisual Studio Code. بعد ذلك فعّل مدير الحزم `pnpm` عبر Corepack:

```bash
node --version
corepack enable
pnpm --version
```

| الأداة | لماذا تحتاجها؟ |
|---|---|
| Node.js 22+ | تشغيل خادم التطوير والبناء. |
| pnpm | تثبيت حزم المشروع وإدارة الأوامر. |
| Visual Studio Code | تحرير المشروع وتشغيل الطرفية المدمجة. |
| MySQL أو TiDB | مطلوب محليًا فقط عند تجربة قاعدة البيانات والحسابات خارج بيئة الاستضافة. |

## 2. فتح المجلد

فك ضغط المشروع، ثم افتح Visual Studio Code واختر **File → Open Folder** وحدد مجلد `warsha-events`. بديلًا عن ذلك، من الطرفية:

```bash
cd path/to/warsha-events
code .
```

افتح الطرفية المدمجة عبر **Terminal → New Terminal**، ثم ثبّت المكتبات:

```bash
pnpm install
```

لا تثبّت الحزم يدويًا واحدةً واحدة؛ يسحب `pnpm install` النسخ المحددة في `package.json` و`pnpm-lock.yaml`.

## 3. تشغيل المشروع

شغّل الأمر التالي من جذر المشروع:

```bash
pnpm dev
```

سيطبع الخادم رابطًا محليًا. افتحه في المتصفح. أوقف الخادم بالضغط على `Ctrl + C` داخل الطرفية.

## 4. إعداد البيئة المحلية للحسابات والبيانات

تعمل المنصة في بيئتها المستضافة لأن إعدادات الحسابات وقاعدة البيانات تُضخ تلقائيًا. لتشغيل **الدخول والحجوزات الدائمة** محليًا، أنشئ ملف `.env` محليًا لا ترفعه إلى Git، ثم أضف قيمًا صالحة لخدمتك:

```dotenv
DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/warsha
JWT_SECRET=replace-with-a-long-random-secret
OAUTH_SERVER_URL=https://your-oauth-server.example
VITE_OAUTH_PORTAL_URL=https://your-oauth-portal.example
VITE_APP_ID=your-app-id
```

بعد ضبط `DATABASE_URL`، أنشئ الجداول من مخطط Drizzle. عند تعديل `drizzle/schema.ts` لاحقًا، ولّد ترحيلًا جديدًا ثم راجع ملف SQL قبل تطبيقه:

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

## 5. أوامر الجودة والاختبار

نفّذ هذه الأوامر قبل إرسال أي تعديل:

```bash
pnpm check
pnpm lint
pnpm test
pnpm build
```

| الأمر | النتيجة المتوقعة |
|---|---|
| `pnpm check` | لا توجد أخطاء TypeScript. |
| `pnpm lint` | لا توجد مخالفات ESLint في كود الواجهة. |
| `pnpm test` | تمر اختبارات قواعد الحجز والمصادقة. |
| `pnpm build` | يتم إنشاء نسخة إنتاج داخل `dist/`. |

## 6. إضافات موصى بها لـ Visual Studio Code

ثبّت الإضافات التالية من تبويب **Extensions**:

| الإضافة | الفائدة |
|---|---|
| ESLint | يعرض أخطاء الجودة داخل المحرر. |
| Tailwind CSS IntelliSense | اقتراحات أصناف Tailwind وشرحها. |
| Prettier - Code formatter | تنسيق الملفات عند الحفظ. |
| Error Lens | يعرض أخطاء TypeScript بوضوح داخل السطر. |
| DotENV | تلوين ملفات `.env`. |

## 7. تشغيل مرجع Next.js

يتضمن المشروع مرجعًا منفصلًا لا يؤثر في تطبيق ورشة الأساسي. افتح طرفية جديدة ثم نفّذ:

```bash
cd nextjs-reference
npm install
npm run dev
```

استخدم الطرفية الأولى لتطبيق ورشة React الكامل، والثانية للمرجع التعليمي في Next.js.

## 8. ملاحظة حول الإشعارات

تعمل رسائل التأكيد والتذكير داخل مركز الرسائل في حساب المستخدم. يتم إنشاء تأكيد الحجز عند نجاحه، ويظهر تذكير للفعاليات القريبة عند فتح الحساب. لا توجد مفاتيح بريد إلكتروني مطلوبة لأن هذه النسخة لا ترسل رسائل خارج المنصة.
