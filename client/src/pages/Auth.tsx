import { useAuth } from "@/_core/hooks/useAuth";
import { BrandMark } from "@/components/BrandMark";
import { TopNav } from "@/components/TopNav";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, KeyRound, Mail, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

type Mode = "login" | "register";

export default function Auth() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSuccess = async () => { await utils.auth.me.invalidate(); setLocation("/"); };
  const login = trpc.auth.login.useMutation({ onSuccess, onError: (reason) => setError(reason.message) });
  const register = trpc.auth.register.useMutation({ onSuccess, onError: (reason) => setError(reason.message) });

  useEffect(() => { if (!loading && user) setLocation("/"); }, [loading, setLocation, user]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (mode === "register") register.mutate({ name, email, password });
    else login.mutate({ email, password });
  }

  const pending = login.isPending || register.isPending;
  return <div className="min-h-screen bg-[color:var(--paper)] text-[#123D3A]" dir="rtl"><TopNav /><main className="mx-auto grid min-h-[calc(100vh-76px)] max-w-6xl items-center gap-8 px-5 py-10 lg:grid-cols-[.85fr_1.15fr] lg:px-8"><section className="relative overflow-hidden border border-[#d9cdbc] bg-[#123D3A] p-8 text-[#fbf7ee] sm:p-12"><BrandMark className="absolute -left-8 -top-7 h-44 w-44 rotate-[9deg] text-[#fbf7ee]/15" /><div className="relative"><p className="text-xs font-bold tracking-[.18em] text-[#f0a27e]">حساب ورشة المحلي</p><h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.55]">دخول بسيط،<br />وتجارب تبقى قريبة.</h1><p className="mt-5 max-w-md text-sm leading-8 text-[#c5d5cd]">لا تحتاج Google أو أي إعداد خارجي. أنشئ حسابك هنا، واحفظ ورشك وسجلك وتقييماتك على هذا الجهاز.</p><div className="mt-10 border-t border-[#89a59a]/40 pt-5 text-xs leading-6 text-[#c5d5cd]">أول حساب يُنشأ في نسخة محلية جديدة يحصل على صلاحية الإدارة لتجربة إدارة البرنامج دون إعداد مسبق.</div></div></section><section className="paper-slip border border-[#d9cdbc] bg-[#fbf7ee] p-7 sm:p-10"><div className="flex gap-2 border-b border-[#dfd2be] pb-5"><button onClick={() => { setMode("login"); setError(""); }} className={`px-3 pb-2 text-sm font-bold ${mode === "login" ? "border-b-2 border-[#e56a3d] text-[#123D3A]" : "text-[#73827c]"}`}>تسجيل الدخول</button><button onClick={() => { setMode("register"); setError(""); }} className={`px-3 pb-2 text-sm font-bold ${mode === "register" ? "border-b-2 border-[#e56a3d] text-[#123D3A]" : "text-[#73827c]"}`}>إنشاء حساب</button></div><div className="mt-7"><p className="text-xs font-bold tracking-[.15em] text-[#b85b3b]">{mode === "login" ? "عودة هادئة" : "بداية جديدة"}</p><h2 className="mt-3 font-display text-3xl font-extrabold">{mode === "login" ? "أكمل من حيث توقفت." : "أنشئ سجلّك في ورشة."}</h2></div><form onSubmit={submit} className="mt-7 space-y-4">{mode === "register" && <label className="block text-xs font-bold">الاسم<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="اسمك الذي سيظهر في الحساب" className="mt-2 w-full border border-[#d8cab5] bg-white px-4 py-3 text-sm font-medium outline-none focus:border-[#123D3A]" /></label>}<label className="block text-xs font-bold">البريد الإلكتروني<div className="mt-2 flex items-center border border-[#d8cab5] bg-white px-4 focus-within:border-[#123D3A]"><Mail size={17} className="text-[#c55632]" /><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full bg-transparent px-3 py-3 text-sm font-medium outline-none" /></div></label><label className="block text-xs font-bold">كلمة المرور<div className="mt-2 flex items-center border border-[#d8cab5] bg-white px-4 focus-within:border-[#123D3A]"><KeyRound size={17} className="text-[#c55632]" /><input required type="password" minLength={mode === "register" ? 8 : 1} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={mode === "register" ? "8 أحرف على الأقل" : "كلمة مرورك"} className="w-full bg-transparent px-3 py-3 text-sm font-medium outline-none" /></div></label>{error && <p role="alert" className="border-r-2 border-[#c55632] bg-[#faeee8] px-3 py-2 text-xs font-bold text-[#9a452d]">{error}</p>}<button disabled={pending} className="mt-2 inline-flex w-full items-center justify-center gap-2 bg-[#123D3A] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#0b2e2c] disabled:opacity-60">{mode === "login" ? <ArrowLeft size={17} /> : <UserPlus size={17} />}{pending ? "يجري الحفظ…" : mode === "login" ? "تسجيل الدخول" : "إنشاء الحساب"}</button></form></section></main></div>;
}
