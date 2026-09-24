export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/** يفتح صفحة الحساب المحلية؛ لا يتطلب OAuth أو متغيرات بيئة. */
export const startLogin = () => {
  window.location.href = "/auth";
};
