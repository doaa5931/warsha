"use client";

import { useActionState, useEffect, useRef } from "react";
import { createBooking, type BookingFormState } from "./actions";

const initialState: BookingFormState = {};

export function BookingForm({ selectedEventId }: { selectedEventId: string }) {
  const [state, formAction, isPending] = useActionState(createBooking, initialState);
  const nameRef = useRef<HTMLInputElement>(null);

  // useRef + didMount: ضع مؤشر الكتابة في أول حقل بعد ترطيب مكوّن العميل.
  useEffect(() => nameRef.current?.focus(), []);

  return (
    <form action={formAction} className="form">
      <input type="hidden" name="eventId" value={selectedEventId} />
      <label>اسم الحاضر<input ref={nameRef} className="input" name="attendeeName" required minLength={2} /></label>
      <label>البريد الإلكتروني<input className="input" name="email" type="email" required /></label>
      <button className="button" disabled={isPending}>{isPending ? "يجري إرسال الطلب…" : "إرسال طلب الحجز"}</button>
      {state.error && <p className="message" role="alert">{state.error}</p>}
      {state.message && <p className="message">{state.message}</p>}
    </form>
  );
}
