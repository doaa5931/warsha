/**
 * فلسفة التصميم: ردهة المعهد الدافئة — بنية SPA واضحة مع مسارات عميل وProvider مركزي للحجوزات.
 */
import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import Home from "@/pages/Home";
import Admin from "@/pages/Admin";
import Auth from "@/pages/Auth";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";

function Routes() {
  return <Switch><Route path="/" component={Home} /><Route path="/auth" component={Auth} /><Route path="/profile" component={Profile} /><Route path="/bookings" component={Profile} /><Route path="/admin" component={Admin} /><Route component={NotFound} /></Switch>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes />
      <Toaster position="top-center" richColors closeButton dir="rtl" />
    </ErrorBoundary>
  );
}
