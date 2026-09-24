import { unstable_cache } from "next/cache";
import { events } from "@/data/events";

// Cache Components/ISR: يُعاد استخدام مصدر الكتالوج لمدة ساعة، لأنه ليس بيانات مستخدم شخصية.
export const getEvents = unstable_cache(async () => events, ["warsha-event-catalog"], { revalidate: 3600, tags: ["events"] });

export async function getEventById(id: string) {
  const allEvents = await getEvents();
  return allEvents.find((event) => event.id === id) ?? null;
}
