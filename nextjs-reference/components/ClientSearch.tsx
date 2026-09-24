"use client";

import type { Event } from "@/data/events";
import { useMemo, useState } from "react";
import { ServerEventCard } from "./ServerEventCard";

// Client Component: يحتاج useState وتفاعل المستخدم، لذلك يحمل التوجيه 'use client'.
export function ClientSearch({ initialEvents }: { initialEvents: Event[] }) {
  const [query, setQuery] = useState("");
  const matches = useMemo(() => initialEvents.filter((event) => `${event.title} ${event.category} ${event.instructor}`.includes(query.trim())), [initialEvents, query]);

  return (
    <>
      <label>
        <span className="eyebrow">ابحث في البرنامج</span>
        <input className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="مثال: تصوير أو حِرف" />
      </label>
      <div className="grid">{matches.map((event) => <ServerEventCard key={event.id} event={event} />)}</div>
    </>
  );
}
