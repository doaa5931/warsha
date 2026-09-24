import { createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "fs";
import path from "path";
import type { User } from "../drizzle/schema";
import { shouldCompleteBooking } from "./bookingRules";
import { canReserveSeats, firstLocalUserRole } from "./localRules";
import { initialProgram } from "./programCatalog";

type Role = "admin" | "user";
type EventStatus = "draft" | "published" | "archived";
type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
type NotificationType = "confirmation" | "reminder" | "system";

type StoredUser = {
  id: number; openId: string; name: string | null; email: string | null; passwordHash: string;
  loginMethod: string | null; role: Role; createdAt: string; updatedAt: string; lastSignedIn: string;
};
type StoredEvent = {
  id: string; title: string; description: string; category: string; startAt: string; durationMinutes: number;
  venue: string; instructor: string; level: string; capacity: number; imageUrl: string; accent: string;
  status: EventStatus; createdAt: string; updatedAt: string;
};
type StoredBooking = {
  id: number; userId: number; eventId: string; attendeeName: string; attendeeEmail: string; seats: number;
  status: BookingStatus; createdAt: string; updatedAt: string;
};
type StoredReview = { id: number; userId: number; bookingId: number; eventId: string; rating: number; comment: string; createdAt: string; updatedAt: string };
type StoredNotification = { id: number; userId: number; bookingId: number | null; type: NotificationType; title: string; body: string; readAt: string | null; createdAt: string };
type LocalStore = {
  version: 1; sessionSecret: string; nextIds: { user: number; booking: number; review: number; notification: number };
  users: StoredUser[]; events: StoredEvent[]; bookings: StoredBooking[]; reviews: StoredReview[]; notifications: StoredNotification[];
};

const dataDir = path.resolve(process.cwd(), ".warsha-local");
const dataFile = path.join(dataDir, "data.json");
let cache: LocalStore | null = null;

function now() { return new Date().toISOString(); }
function asDate(value: string) { return new Date(value); }
function localUser(user: StoredUser): User { return { ...user, createdAt: asDate(user.createdAt), updatedAt: asDate(user.updatedAt), lastSignedIn: asDate(user.lastSignedIn) }; }
function makeInitialStore(): LocalStore {
  const timestamp = now();
  return {
    version: 1,
    sessionSecret: randomBytes(48).toString("hex"),
    nextIds: { user: 1, booking: 1, review: 1, notification: 1 },
    users: [],
    events: initialProgram.map((event) => ({
      id: event.id, title: event.title, description: event.description, category: event.category,
      startAt: new Date(event.startAt ?? timestamp).toISOString(), durationMinutes: event.durationMinutes ?? 120,
      venue: event.venue, instructor: event.instructor, level: event.level, capacity: event.capacity ?? 12,
      imageUrl: event.imageUrl, accent: event.accent ?? "#E56A3D", status: (event.status ?? "published") as EventStatus,
      createdAt: timestamp, updatedAt: timestamp,
    })),
    bookings: [], reviews: [], notifications: [],
  };
}
function getStore(): LocalStore {
  if (cache) return cache;
  if (!existsSync(dataFile)) {
    mkdirSync(dataDir, { recursive: true });
    cache = makeInitialStore();
    persist();
    return cache;
  }
  try {
    cache = JSON.parse(readFileSync(dataFile, "utf8")) as LocalStore;
    return cache;
  } catch {
    const backup = `${dataFile}.corrupt-${Date.now()}`;
    try { renameSync(dataFile, backup); } catch {}
    cache = makeInitialStore();
    persist();
    return cache;
  }
}
function persist() {
  if (!cache) return;
  mkdirSync(dataDir, { recursive: true });
  const tempFile = `${dataFile}.${randomUUID()}.tmp`;
  writeFileSync(tempFile, JSON.stringify(cache, null, 2), "utf8");
  renameSync(tempFile, dataFile);
}
function mutate<T>(operation: (store: LocalStore) => T): T { const result = operation(getStore()); persist(); return result; }
function withoutPassword(user: StoredUser) { const { passwordHash: _passwordHash, ...safeUser } = user; return safeUser; }
function eventForClient(event: StoredEvent, reserved = 0) { return { ...event, startAt: asDate(event.startAt), createdAt: asDate(event.createdAt), updatedAt: asDate(event.updatedAt), reserved }; }
function bookingForClient(booking: StoredBooking, event: StoredEvent | undefined) {
  return {
    ...booking, createdAt: asDate(booking.createdAt), updatedAt: asDate(booking.updatedAt),
    eventTitle: event?.title ?? null, eventDescription: event?.description ?? null, eventCategory: event?.category ?? null,
    eventStartAt: event ? asDate(event.startAt) : null, eventDurationMinutes: event?.durationMinutes ?? null,
    eventVenue: event?.venue ?? null, eventInstructor: event?.instructor ?? null, eventLevel: event?.level ?? null,
    eventCapacity: event?.capacity ?? null, eventImageUrl: event?.imageUrl ?? null, eventAccent: event?.accent ?? null,
  };
}

function hashPassword(password: string) { const salt = randomBytes(16).toString("hex"); return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`; }
function verifyPassword(password: string, stored: string) {
  const [salt, savedHash] = stored.split(":");
  if (!salt || !savedHash) return false;
  const derived = scryptSync(password, salt, 64).toString("hex");
  return timingSafeEqual(Buffer.from(savedHash, "hex"), Buffer.from(derived, "hex"));
}
function encodeSession(userId: number) {
  const store = getStore(); const payload = Buffer.from(JSON.stringify({ userId, expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30 })).toString("base64url");
  const signature = createHmac("sha256", store.sessionSecret).update(payload).digest("base64url"); return `${payload}.${signature}`;
}
function decodeSession(token: string | undefined) {
  if (!token) return null; const [payload, signature] = token.split("."); if (!payload || !signature) return null;
  const expected = createHmac("sha256", getStore().sessionSecret).update(payload).digest("base64url");
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try { const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { userId: number; expiresAt: number }; return data.expiresAt > Date.now() ? data : null; } catch { return null; }
}

export function registerLocalUser(input: { name: string; email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  if (getStore().users.some((user) => user.email?.toLowerCase() === email)) throw new Error("يوجد حساب مسجل بهذا البريد الإلكتروني.");
  const user = mutate((store) => {
    const timestamp = now(); const id = store.nextIds.user++;
    const record: StoredUser = { id, openId: `local_${randomUUID()}`, name: input.name.trim(), email, passwordHash: hashPassword(input.password), loginMethod: "local", role: firstLocalUserRole(store.users.length), createdAt: timestamp, updatedAt: timestamp, lastSignedIn: timestamp };
    store.users.push(record); return record;
  });
  return { user: localUser(user), sessionToken: encodeSession(user.id) };
}
export function loginLocalUser(input: { email: string; password: string }) {
  const user = getStore().users.find((item) => item.email?.toLowerCase() === input.email.trim().toLowerCase());
  if (!user || !verifyPassword(input.password, user.passwordHash)) throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
  mutate((store) => { const record = store.users.find((item) => item.id === user.id)!; record.lastSignedIn = now(); record.updatedAt = now(); });
  return { user: localUser(getStore().users.find((item) => item.id === user.id)!), sessionToken: encodeSession(user.id) };
}
export function getUserFromSession(token: string | undefined) { const session = decodeSession(token); if (!session) return null; const user = getStore().users.find((item) => item.id === session.userId); return user ? localUser(user) : null; }
export function getUserByOpenId(openId: string) { const user = getStore().users.find((item) => item.openId === openId); return user ? localUser(user) : undefined; }
export function getUserById(id: number) { const user = getStore().users.find((item) => item.id === id); return user ? localUser(user) : undefined; }
export async function upsertUser(_user?: unknown) { /* الاحتفاظ بالدالة للتوافق؛ الحسابات المحلية تنشأ عبر registerLocalUser. */ }

export async function createBooking(input: { userId: number; eventId: string; attendeeName: string; attendeeEmail: string; seats: number; status: BookingStatus }) {
  const event = getStore().events.find((item) => item.id === input.eventId && item.status === "published");
  if (!event) throw new Error("هذه الفعالية غير متاحة للحجز.");
  const reserved = getStore().bookings.filter((item) => item.eventId === event.id && ["pending", "confirmed", "completed"].includes(item.status)).reduce((sum, item) => sum + item.seats, 0);
  if (!canReserveSeats(event.capacity, reserved, input.seats)) throw new Error("عدد المقاعد المطلوب غير متاح.");
  const booking = mutate((store) => { const timestamp = now(); const record: StoredBooking = { id: store.nextIds.booking++, ...input, status: "confirmed", createdAt: timestamp, updatedAt: timestamp }; store.bookings.push(record); return record; });
  await createNotification({ userId: input.userId, bookingId: booking.id, type: "confirmation", title: "تم تأكيد حجزك", body: `حُفظ ${input.seats} مقعد${input.seats > 1 ? "ين" : ""} لورشة «${event.title}».` });
  return booking.id;
}
export async function getBookingsForUser(userId: number) {
  let hasChanges = false;
  mutate((store) => { for (const booking of store.bookings.filter((item) => item.userId === userId)) if (shouldCompleteBooking(booking.status, booking.eventId)) { booking.status = "completed"; booking.updatedAt = now(); hasChanges = true; } });
  const store = getStore(); return store.bookings.filter((item) => item.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((booking) => bookingForClient(booking, store.events.find((event) => event.id === booking.eventId)));
}
export async function cancelBooking(userId: number, bookingId: number) { mutate((store) => { const booking = store.bookings.find((item) => item.id === bookingId && item.userId === userId && item.status === "confirmed"); if (booking) { booking.status = "cancelled"; booking.updatedAt = now(); } }); }
export async function completeBookingForAdmin(bookingId: number) { mutate((store) => { const booking = store.bookings.find((item) => item.id === bookingId && item.status === "confirmed"); if (booking) { booking.status = "completed"; booking.updatedAt = now(); } }); }
export async function getBookingForReview(userId: number, bookingId: number) { const booking = getStore().bookings.find((item) => item.id === bookingId && item.userId === userId); return booking ? { ...booking, createdAt: asDate(booking.createdAt), updatedAt: asDate(booking.updatedAt) } : undefined; }
export async function createReview(input: { userId: number; bookingId: number; eventId: string; rating: number; comment: string }) {
  if (getStore().reviews.some((review) => review.userId === input.userId && review.eventId === input.eventId)) throw new Error("أضفت تقييمك لهذه الفعالية مسبقًا.");
  const review = mutate((store) => { const timestamp = now(); const record: StoredReview = { id: store.nextIds.review++, ...input, createdAt: timestamp, updatedAt: timestamp }; store.reviews.push(record); return record; }); return review.id;
}
export async function getReviewsForEvent(eventId: string) { const store = getStore(); return store.reviews.filter((item) => item.eventId === eventId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((review) => ({ id: review.id, rating: review.rating, comment: review.comment, createdAt: asDate(review.createdAt), reviewerName: store.users.find((user) => user.id === review.userId)?.name ?? "مشارك ورشة" })); }
export async function getReviewsForUser(userId: number) { return getStore().reviews.filter((item) => item.userId === userId).map((review) => ({ ...review, createdAt: asDate(review.createdAt), updatedAt: asDate(review.updatedAt) })); }

export async function ensureEventCatalog() { getStore(); }
export async function getEvents(status?: EventStatus) { const store = getStore(); return store.events.filter((event) => !status || event.status === status).sort((a, b) => a.startAt.localeCompare(b.startAt)).map((event) => eventForClient(event, store.bookings.filter((booking) => booking.eventId === event.id && ["pending", "confirmed", "completed"].includes(booking.status)).reduce((sum, booking) => sum + booking.seats, 0))); }
export async function createEvent(input: { id: string; title: string; description: string; category: string; startAt: Date; durationMinutes: number; venue: string; instructor: string; level: string; capacity: number; imageUrl: string; accent: string; status: EventStatus }) { mutate((store) => { if (store.events.some((event) => event.id === input.id)) throw new Error("هذا المعرّف مستخدم لفعالية أخرى."); const timestamp = now(); store.events.push({ ...input, startAt: input.startAt.toISOString(), createdAt: timestamp, updatedAt: timestamp }); }); }
export async function updateEvent(id: string, input: Partial<{ status: EventStatus; title: string; capacity: number; startAt: Date; venue: string }>) { mutate((store) => { const event = store.events.find((item) => item.id === id); if (!event) throw new Error("الفعالية غير موجودة."); Object.assign(event, { ...input, startAt: input.startAt ? input.startAt.toISOString() : event.startAt, updatedAt: now() }); }); }
export async function getAllBookingsForAdmin() { const store = getStore(); return store.bookings.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((booking) => ({ ...booking, createdAt: asDate(booking.createdAt), userName: store.users.find((user) => user.id === booking.userId)?.name ?? null, userEmail: store.users.find((user) => user.id === booking.userId)?.email ?? null })); }
export async function updateBookingStatusForAdmin(bookingId: number, status: "confirmed" | "completed" | "cancelled") { mutate((store) => { const booking = store.bookings.find((item) => item.id === bookingId); if (!booking) throw new Error("الحجز غير موجود."); booking.status = status; booking.updatedAt = now(); }); }

type NotificationInput = { userId: number; bookingId?: number | null; type: NotificationType; title: string; body: string };
export async function createNotification(input: NotificationInput) { mutate((store) => { const existing = input.bookingId ? store.notifications.find((item) => item.bookingId === input.bookingId && item.type === input.type) : undefined; if (existing) { existing.title = input.title; existing.body = input.body; return; } store.notifications.push({ id: store.nextIds.notification++, userId: input.userId, bookingId: input.bookingId ?? null, type: input.type, title: input.title, body: input.body, readAt: null, createdAt: now() }); }); }
async function ensureDueReminders(userId: number) { const store = getStore(); const nowTime = Date.now(); for (const booking of store.bookings.filter((item) => item.userId === userId && item.status === "confirmed")) { const event = store.events.find((item) => item.id === booking.eventId); if (!event) continue; const hours = (asDate(event.startAt).getTime() - nowTime) / 3_600_000; if (hours >= 0 && hours <= 48) await createNotification({ userId, bookingId: booking.id, type: "reminder", title: "تذكير بموعدك القريب", body: `تبدأ ورشة «${event.title}» خلال أقل من 48 ساعة في ${event.venue}.` }); } }
export async function getNotificationsForUser(userId: number) { await ensureDueReminders(userId); return getStore().notifications.filter((item) => item.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((notification) => ({ ...notification, readAt: notification.readAt ? asDate(notification.readAt) : null, createdAt: asDate(notification.createdAt) })); }
export async function markNotificationsRead(userId: number) { mutate((store) => { for (const notification of store.notifications.filter((item) => item.userId === userId && !item.readAt)) notification.readAt = now(); }); }

export function getLocalDataFile() { return dataFile; }
export function resetLocalStoreForTests() { cache = makeInitialStore(); persist(); }
