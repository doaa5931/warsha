import { events } from "@/data/events";
import { NextResponse } from "next/server";

// Route Handler: API مكافئ عملي لـ API Routes القديمة، داخل app/api/events/route.ts.
export async function GET() {
  return NextResponse.json({ data: events, count: events.length });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { title?: unknown } | null;
  if (!body || typeof body.title !== "string" || body.title.trim().length < 3) {
    return NextResponse.json({ error: "العنوان مطلوب ويجب أن يحتوي 3 أحرف على الأقل." }, { status: 400 });
  }
  return NextResponse.json({ data: { id: crypto.randomUUID(), title: body.title.trim() } }, { status: 201 });
}
