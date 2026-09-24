/**
 * فلسفة التصميم: ردهة المعهد الدافئة — مدخل React بسيط يحمّل Tailwind وBootstrap ومظهر التطبيق العربي.
 */
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import { trpc } from "@/lib/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";

function Root() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() => trpc.createClient({ links: [httpBatchLink({ url: "/api/trpc", transformer: superjson })] }));
  return <trpc.Provider client={trpcClient} queryClient={queryClient}><QueryClientProvider client={queryClient}><App /></QueryClientProvider></trpc.Provider>;
}

document.documentElement.dir = "rtl";
document.documentElement.lang = "ar";
createRoot(document.getElementById("root")!).render(<StrictMode><Root /></StrictMode>);
