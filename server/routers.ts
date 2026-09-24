import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { cancelBooking, completeBookingForAdmin, createBooking, createEvent, createReview, getAllBookingsForAdmin, getBookingForReview, getBookingsForUser, getEvents, getNotificationsForUser, getReviewsForEvent, getReviewsForUser, loginLocalUser, markNotificationsRead, registerLocalUser, updateBookingStatusForAdmin, updateEvent } from "./db";
import { isReviewEligible, isValidRating } from "./bookingRules";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    register: publicProcedure
      .input(z.object({ name: z.string().trim().min(2, "اكتب اسمًا من حرفين على الأقل.").max(120), email: z.string().trim().email("اكتب بريدًا إلكترونيًا صحيحًا.").max(320), password: z.string().min(8, "كلمة المرور يجب أن تتكون من 8 أحرف على الأقل.").max(128) }))
      .mutation(({ ctx, input }) => {
        const { user, sessionToken } = registerLocalUser(input);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...getSessionCookieOptions(ctx.req), maxAge: 1000 * 60 * 60 * 24 * 30 });
        return user;
      }),
    login: publicProcedure
      .input(z.object({ email: z.string().trim().email("اكتب بريدًا إلكترونيًا صحيحًا.").max(320), password: z.string().min(1, "اكتب كلمة المرور.").max(128) }))
      .mutation(({ ctx, input }) => {
        const { user, sessionToken } = loginLocalUser(input);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...getSessionCookieOptions(ctx.req), maxAge: 1000 * 60 * 60 * 24 * 30 });
        return user;
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  bookings: router({
    mine: protectedProcedure.query(({ ctx }) => getBookingsForUser(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({ eventId: z.string().min(1).max(128), attendeeName: z.string().trim().min(2).max(160), attendeeEmail: z.string().trim().email().max(320), seats: z.number().int().min(1).max(5) }))
      .mutation(async ({ ctx, input }) => {
        const id = await createBooking({ userId: ctx.user.id, ...input, status: "confirmed" });
        return { id, status: "confirmed" as const };
      }),
    cancel: protectedProcedure
      .input(z.object({ bookingId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        await cancelBooking(ctx.user.id, input.bookingId);
        return { success: true };
      }),
    completeForAdmin: adminProcedure
      .input(z.object({ bookingId: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        await completeBookingForAdmin(input.bookingId);
        return { success: true };
      }),
  }),
  events: router({
    published: publicProcedure.query(() => getEvents("published")),
    adminList: adminProcedure.query(() => getEvents()),
    create: adminProcedure
      .input(z.object({ id: z.string().trim().min(3).max(128), title: z.string().trim().min(3).max(220), description: z.string().trim().min(12), category: z.string().trim().min(2).max(64), startAt: z.date(), durationMinutes: z.number().int().min(30).max(720), venue: z.string().trim().min(3).max(220), instructor: z.string().trim().min(2).max(160), level: z.string().trim().min(2).max(80), capacity: z.number().int().min(1).max(500), imageUrl: z.string().url(), accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/), status: z.enum(["draft", "published", "archived"]) }))
      .mutation(async ({ input }) => { await createEvent(input); return { success: true }; }),
    update: adminProcedure
      .input(z.object({ id: z.string().min(3).max(128), status: z.enum(["draft", "published", "archived"]).optional(), title: z.string().trim().min(3).max(220).optional(), capacity: z.number().int().min(1).max(500).optional(), startAt: z.date().optional(), venue: z.string().trim().min(3).max(220).optional() }))
      .mutation(async ({ input }) => { const { id, ...changes } = input; await updateEvent(id, changes); return { success: true }; }),
  }),
  admin: router({
    bookings: adminProcedure.query(() => getAllBookingsForAdmin()),
    updateBookingStatus: adminProcedure.input(z.object({ bookingId: z.number().int().positive(), status: z.enum(["confirmed", "completed", "cancelled"]) })).mutation(async ({ input }) => { await updateBookingStatusForAdmin(input.bookingId, input.status); return { success: true }; }),
  }),
  notifications: router({
    mine: protectedProcedure.query(({ ctx }) => getNotificationsForUser(ctx.user.id)),
    markRead: protectedProcedure.mutation(async ({ ctx }) => { await markNotificationsRead(ctx.user.id); return { success: true }; }),
  }),
  reviews: router({
    listByEvent: publicProcedure.input(z.object({ eventId: z.string().min(1).max(128) })).query(({ input }) => getReviewsForEvent(input.eventId)),
    mine: protectedProcedure.query(({ ctx }) => getReviewsForUser(ctx.user.id)),
    eligibility: protectedProcedure.input(z.object({ bookingId: z.number().int().positive() })).query(async ({ ctx, input }) => {
      const booking = await getBookingForReview(ctx.user.id, input.bookingId);
      return { eligible: Boolean(booking && isReviewEligible(booking.status)), eventId: booking?.eventId ?? null };
    }),
    create: protectedProcedure
      .input(z.object({ bookingId: z.number().int().positive(), rating: z.number().int().min(1).max(5), comment: z.string().trim().min(8).max(1000) }))
      .mutation(async ({ ctx, input }) => {
        if (!isValidRating(input.rating)) throw new Error("التقييم يجب أن يكون بين نجمة وخمس نجوم.");
        const booking = await getBookingForReview(ctx.user.id, input.bookingId);
        if (!booking || !isReviewEligible(booking.status)) throw new Error("يمكن إضافة تقييم بعد اكتمال الحجز فقط.");
        const id = await createReview({ userId: ctx.user.id, bookingId: booking.id, eventId: booking.eventId, rating: input.rating, comment: input.comment });
        return { id };
      }),
  }),
});

export type AppRouter = typeof appRouter;
