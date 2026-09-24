import { int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const bookingStatusValues = ["pending", "confirmed", "completed", "cancelled"] as const;
export const eventStatusValues = ["draft", "published", "archived"] as const;
export const notificationTypeValues = ["confirmation", "reminder", "system"] as const;

export const events = mysqlTable("events", {
  id: varchar("id", { length: 128 }).primaryKey(),
  title: varchar("title", { length: 220 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 64 }).notNull(),
  startAt: timestamp("startAt").notNull(),
  durationMinutes: int("durationMinutes").notNull().default(120),
  venue: varchar("venue", { length: 220 }).notNull(),
  instructor: varchar("instructor", { length: 160 }).notNull(),
  level: varchar("level", { length: 80 }).notNull(),
  capacity: int("capacity").notNull().default(12),
  imageUrl: text("imageUrl").notNull(),
  accent: varchar("accent", { length: 32 }).notNull().default("#E56A3D"),
  status: mysqlEnum("status", eventStatusValues).notNull().default("draft"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  eventId: varchar("eventId", { length: 128 }).notNull(),
  attendeeName: varchar("attendeeName", { length: 160 }).notNull(),
  attendeeEmail: varchar("attendeeEmail", { length: 320 }).notNull(),
  seats: int("seats").notNull().default(1),
  status: mysqlEnum("status", bookingStatusValues).notNull().default("confirmed"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const reviews = mysqlTable(
  "reviews",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    bookingId: int("bookingId").notNull().references(() => bookings.id, { onDelete: "cascade" }),
    eventId: varchar("eventId", { length: 128 }).notNull(),
    rating: int("rating").notNull(),
    comment: text("comment").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    uniqueIndex("reviews_user_event_unique").on(table.userId, table.eventId),
    uniqueIndex("reviews_booking_unique").on(table.bookingId),
  ],
);

export const notifications = mysqlTable(
  "notifications",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    bookingId: int("bookingId").references(() => bookings.id, { onDelete: "cascade" }),
    type: mysqlEnum("type", notificationTypeValues).notNull(),
    title: varchar("title", { length: 220 }).notNull(),
    body: text("body").notNull(),
    readAt: timestamp("readAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("notifications_booking_type_unique").on(table.bookingId, table.type)],
);

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;
export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
