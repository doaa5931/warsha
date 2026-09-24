export type Event = {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  instructor: string;
  seatsLeft: number;
  description: string;
  image: string;
};

export const events: Event[] = [
  { id: "ceramics-forms", title: "لغة الطين: أوّل شكل لك", category: "حِرف", date: "2026-09-04", time: "16:30", instructor: "ليان الحسن", seatsLeft: 5, description: "تطبيق عملي هادئ لتشكيل كوبك الأول والاحتفاظ به بعد التجفيف.", image: "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=1200&q=85" },
  { id: "product-thinking", title: "من الفكرة إلى النموذج", category: "تقنية", date: "2026-09-05", time: "18:00", instructor: "عمر الرفاعي", seatsLeft: 7, description: "مبادئ تصميم المنتجات الرقمية وبناء نموذج واضح يمكن اختباره في يوم واحد.", image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=85" },
  { id: "street-frames", title: "إطار المدينة: مشي وتصوير", category: "تصوير", date: "2026-09-06", time: "17:00", instructor: "نور عيسى", seatsLeft: 3, description: "جولة لتدريب العين على الضوء والحكايات الصغيرة في الشارع.", image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=85" },
];
