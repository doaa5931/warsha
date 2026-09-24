$ErrorActionPreference = "Stop"

Write-Host "Starting Warsha project..." -ForegroundColor Cyan
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw "Node.js is not installed. Download it from https://nodejs.org and run this script again."
}
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  Write-Host "Enabling pnpm through Corepack..." -ForegroundColor Yellow
  corepack enable
}

pnpm install
pnpm dev
