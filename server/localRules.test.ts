import { describe, expect, it } from "vitest";
import { canReserveSeats, firstLocalUserRole } from "./localRules";

describe("قواعد النسخة المحلية", () => {
  it("يعطي أول حساب دور الإدارة ثم يجعل الحسابات التالية عادية", () => {
    expect(firstLocalUserRole(0)).toBe("admin");
    expect(firstLocalUserRole(1)).toBe("user");
  });

  it("يمنع الحجز فوق السعة ويرفض عدد مقاعد غير صالح", () => {
    expect(canReserveSeats(10, 7, 3)).toBe(true);
    expect(canReserveSeats(10, 7, 4)).toBe(false);
    expect(canReserveSeats(10, 7, 0)).toBe(false);
  });
});
