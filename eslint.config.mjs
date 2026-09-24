// فلسفة المشروع: تحليل مبكر لمشكلات React وHooks قبل التشغيل.
import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist",
      "node_modules",
      "nextjs-reference",
      "server",
      "client/src/components/ui/**",
      "client/src/components/LoginDialog.tsx",
      "client/src/components/DashboardLayout.tsx",
      "client/src/contexts/ThemeContext.tsx",
      "client/src/_core/**",
      "client/src/hooks/useMobile.tsx",
      "client/src/hooks/usePersistFn.ts",
      "client/src/pages/ComponentShowcase.tsx",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["client/src/**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks, "react-refresh": reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": "off",
    },
  },
);
