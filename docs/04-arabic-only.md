# التغيير الرابع: اعتماد العربية فقط

تم إلغاء زر تبديل اللغة لأن النسخة المطلوبة عربية فقط.

## الملفات المعدلة

- `client/src/components/TopNav.tsx`: حذف زر `EN/ع` وحذف منطق `useLanguage`، مع تثبيت النصوص العربية.
- `client/src/main.tsx`: حذف `LanguageProvider` وتثبيت `lang="ar"` و`dir="rtl"`.
- `client/src/index.css`: تثبيت اتجاه RTL وإزالة قواعد اتجاه LTR.
- `client/src/contexts/LanguageContext.tsx`: حذف الملف لأنه لم يعد مستخدمًا.

## النتيجة

يظهر الموقع باللغة العربية فقط، ويحتفظ بزر الثيم الليلي/النهاري دون زر لغة.
