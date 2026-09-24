/**
 * فلسفة التصميم: ردهة المعهد الدافئة — Hook نظيف يحفظ اختيارات الزائر بدون تعطيل بساطة الواجهة.
 */
import { useCallback, useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  const updateValue = useCallback((nextValue: T | ((previous: T) => T)) => {
    setValue((previous) => (typeof nextValue === "function" ? (nextValue as (previous: T) => T)(previous) : nextValue));
  }, []);

  return [value, updateValue] as const;
}
