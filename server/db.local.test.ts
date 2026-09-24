import { afterEach, describe, expect, it } from "vitest";
import { getUserFromSession, loginLocalUser, registerLocalUser, resetLocalStoreForTests } from "./db";

describe("الحسابات المحلية ذاتية التشغيل", () => {
  afterEach(() => resetLocalStoreForTests());

  it("ينشئ أول حساب كمدير ويحفظ جلسة محلية قابلة للتحقق", () => {
    resetLocalStoreForTests();
    const { user, sessionToken } = registerLocalUser({ name: "مدير ورشة", email: "admin@warsha.local", password: "local-pass-123" });
    expect(user.role).toBe("admin");
    expect(getUserFromSession(sessionToken)?.email).toBe("admin@warsha.local");
  });

  it("يسجل الدخول بكلمة المرور الصحيحة ويرفض كلمة المرور الخاطئة", () => {
    resetLocalStoreForTests();
    registerLocalUser({ name: "مشاركة", email: "user@warsha.local", password: "local-pass-123" });
    expect(loginLocalUser({ email: "user@warsha.local", password: "local-pass-123" }).user.name).toBe("مشاركة");
    expect(() => loginLocalUser({ email: "user@warsha.local", password: "wrong-password" })).toThrow("البريد الإلكتروني أو كلمة المرور غير صحيحة");
  });
});
