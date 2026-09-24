/**
 * فلسفة التصميم: ردهة المعهد الدافئة — شريط علوي واضح يحتفظ بالرمز وبوابة دائمة للحجوزات.
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { BrandMark } from "@/components/BrandMark";
import { Bell, Moon, Sun, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

export function TopNav() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const copy = { program: "البرنامج", profile: "ملفي", admin: "الإدارة", login: "تسجيل الدخول", logout: "خروج", brand: "للتجارب الحيّة" };
  const { data: notifications = [] } = trpc.notifications.mine.useQuery(undefined, { enabled: isAuthenticated });
  const unreadNotifications = notifications.filter((notification) => !notification.readAt).length;
  const [theme, setTheme] = useState<"light" | "dark">(() => document.documentElement.dataset.theme === "dark" ? "dark" : "light");

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = nextTheme;
    setTheme(nextTheme);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#dfd5c4]/90 bg-[color:var(--paper)]/92 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-4 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <BrandMark className="h-11 w-11 text-[#123D3A]" />
          <div className="leading-none">
            <span className="font-display text-xl font-extrabold tracking-tight text-[#123D3A]">ورشة</span>
            <span className="mt-1 block text-[10px] font-bold tracking-[0.18em] text-[#b85b3b]">{copy.brand}</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-bold text-[#45605b] md:flex">
          <Link className={location === "/" ? "text-[#123D3A]" : "transition hover:text-[#123D3A]"} href="/">{copy.program}</Link>
          <Link className={location === "/profile" ? "text-[#123D3A]" : "transition hover:text-[#123D3A]"} href="/profile">{copy.profile}</Link>
          {user?.role === "admin" && <Link className={location === "/admin" ? "text-[#123D3A]" : "transition hover:text-[#123D3A]"} href="/admin">{copy.admin}</Link>}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="grid h-10 w-10 place-items-center border border-[#dfd5c4] text-[#123D3A] transition hover:bg-[#f3ede1] active:scale-[.97]" aria-label="تبديل المظهر">
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          {isAuthenticated ? <div className="flex items-center gap-2"><Link href="/profile#notifications" className="relative grid h-10 w-10 place-items-center border border-[#d8cbb9] text-[#123D3A] transition hover:bg-[#f2ecdf]" aria-label="مركز الإشعارات"><Bell size={17} />{unreadNotifications > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#e56a3d] px-1 text-[10px] font-bold text-white">{unreadNotifications}</span>}</Link><Link href="/profile" className="relative inline-flex h-10 items-center gap-2 bg-[#123D3A] px-3.5 text-sm font-bold text-white transition hover:bg-[#0b2e2c] active:scale-[.97]"><UserRound size={17} /><span className="hidden sm:inline">{user?.name || copy.profile}</span></Link><button onClick={() => logout()} className="hidden h-10 border border-[#d8cbb9] px-3 text-xs font-bold text-[#123D3A] hover:bg-[#f2ecdf] md:block">{copy.logout}</button></div> : <button onClick={startLogin} className="inline-flex h-10 items-center gap-2 bg-[#123D3A] px-3.5 text-sm font-bold text-white transition hover:bg-[#0b2e2c] active:scale-[.97]"><UserRound size={17} /> <span className="hidden sm:inline">{copy.login}</span></button>}
        </div>
      </div>
    </header>
  );
}
