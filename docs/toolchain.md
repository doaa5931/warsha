# مختبر أدوات البناء: npm وVite وWebpack وBabel وESLint

## ما يستعمله المشروع فعليًا

| الأداة | دورها في «ورشة» |
|---|---|
| `pnpm` / `npm` | تثبيت الاعتمادات وتشغيل scripts مثل `dev` و`build` و`lint`. |
| Vite | خادم التطوير وبناء React SPA؛ ضبطه في `vite.config.ts`. |
| Babel | يعالج JSX وتحويلات React من خلال `@vitejs/plugin-react`. React Compiler مضاف كـ Babel plugin. |
| ESLint | يحلل TypeScript وReact Hooks عبر `eslint.config.mjs`؛ نفّذ `pnpm lint`. |
| Webpack | **تمرين مقارن**، لا يعمل بجانب Vite في التطبيق نفسه حتى لا يتكرر نظام البناء بلا فائدة. |

## لماذا لا نستعمل Vite وWebpack معًا؟

كلاهما bundler. تشغيل الاثنين في pipeline واحد يزيد التعقيد ولا يضيف للمستخدم قيمة. لذلك يظل Vite اختيار التنفيذ، بينما المثال التالي يشرح شكل إعداد Webpack/Babel لو احتاجه مشروع قديم:

```js
// webpack.config.cjs (مثال تعليمي، لا تنسخه إلى Vite project دون تغيير scripts)
const path = require("path");
module.exports = {
  entry: "./src/main.tsx",
  output: { path: path.resolve(__dirname, "dist"), filename: "bundle.js" },
  resolve: { extensions: [".ts", ".tsx", ".js"] },
  module: { rules: [{ test: /\.[jt]sx?$/, exclude: /node_modules/, use: "babel-loader" }] },
};
```

```json
// .babelrc.json (مثال تعليمي)
{ "presets": ["@babel/preset-env", ["@babel/preset-react", { "runtime": "automatic" }], "@babel/preset-typescript"] }
```

> إن أردت تشغيل Webpack بدل Vite فعليًا، أضف `webpack`, `webpack-cli`, `babel-loader`, وBabel presets، ثم بدّل script البناء. لا تشغلهما معًا لمجرد تغطية المصطلحات.
