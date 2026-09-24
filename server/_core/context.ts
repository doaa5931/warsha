import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { parse as parseCookie } from "cookie";
import { COOKIE_NAME } from "@shared/const";
import { getUserFromSession } from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  const token = parseCookie(opts.req.headers.cookie ?? "")[COOKIE_NAME];
  const user: User | null = getUserFromSession(token);

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
