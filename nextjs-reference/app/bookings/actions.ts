"use server";

export type BookingFormState = { error?: string; message?: string };

// Form Action: تُنفذ على الخادم وتتحقق من الإدخال قبل أي كتابة حقيقية لقاعدة البيانات.
export async function createBooking(_previousState: BookingFormState, formData: FormData): Promise<BookingFormState> {
  const eventId = formData.get("eventId");
  const attendeeName = formData.get("attendeeName");
  const email = formData.get("email");

  if (typeof eventId !== "string" || typeof attendeeName !== "string" || attendeeName.trim().length < 2 || typeof email !== "string" || !email.includes("@")) {
    return { error: "أدخل اسمًا صحيحًا وبريدًا إلكترونيًا صالحًا، ثم اختر فعالية." };
  }

  return { message: `تم استلام طلب ${attendeeName.trim()} للفعالية ${eventId}. اربط هذه الدالة بقاعدة بيانات لاحقًا.` };
}
