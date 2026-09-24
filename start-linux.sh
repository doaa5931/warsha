#!/usr/bin/env bash
set -e

echo "تشغيل مشروع ورشة..."
command -v node >/dev/null 2>&1 || { echo "Node.js غير مثبت. نزّله من https://nodejs.org ثم أعد التشغيل."; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "تفعيل pnpm عبر Corepack..."; corepack enable; }

pnpm install
pnpm dev
