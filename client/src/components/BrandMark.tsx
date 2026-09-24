/**
 * فلسفة التصميم: ردهة المعهد الدافئة — رمز أقواس متداخلة بلون Petrol Ink ونقطة طينية.
 */
export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 54C12 35.2 24.9 22 40 22s28 13.2 28 32" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
      <path d="M21 54c0-13.7 8.5-23 19-23s19 9.3 19 23" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
      <path d="M30 54c0-8.3 4.5-14 10-14s10 5.7 10 14" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
      <circle cx="40" cy="57" r="6" fill="#E56A3D" />
    </svg>
  );
}
