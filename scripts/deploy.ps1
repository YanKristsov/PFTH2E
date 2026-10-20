param(
  [switch]$SkipBuild,
  [switch]$NoPush
)

$ErrorActionPreference = "Stop"
$repoRoot = "D:\Files\PTHFNDR"
$gitExe = "C:\Program Files\Git\cmd\git.exe"
$distDir = Join-Path $repoRoot "dist"

Set-Location $repoRoot

Write-Host "==> Deploy started" -ForegroundColor Cyan

if (-not $SkipBuild) {
  Write-Host "==> Building..." -ForegroundColor Cyan
  npm run build
  if ($LASTEXITCODE -ne 0) { throw "Build failed with exit code $LASTEXITCODE" }
}

if (-not (Test-Path $distDir)) {
  throw "dist/ not found. Run build first."
}

# Clean old site artifacts in repo root (keep .git, .gitignore, src/, public/, scripts/ etc not needed)
$artifactsToClean = @(
  "assets",
  "sw.js",
  "workbox-register-sw.js",
  "workbox-*.js",
  "manifest.webmanifest",
  "404.html",
  "registerSW.js",
  "robots.txt",
  "favicon.svg",
  "favicon.ico",
  "apple-touch-icon.png",
  "mask-icon.svg",
  "pwa-192x192.png",
  "pwa-512x512.png",
  "pwa-maskable-192x192.png",
  "pwa-maskable-512x512.png",
  "spells.json",
  "spells.index.json",
  "spells-parsed.json",
  "icons.svg"
)

foreach ($pattern in $artifactsToClean) {
  $items = Get-ChildItem -Path $repoRoot -Filter $pattern -ErrorAction SilentlyContinue
  foreach ($item in $items) {
    if ($item.Name -eq ".git") { continue }
    Write-Host "==> Removing $($item.Name)" -ForegroundColor Yellow
    if ($item.PSIsContainer) {
      Remove-Item -Path $item.FullName -Recurse -Force
    } else {
      Remove-Item -Path $item.FullName -Force
    }
  }
}

# Also remove old hashed assets more aggressively
if (Test-Path (Join-Path $repoRoot "assets")) {
  Remove-Item -Path (Join-Path $repoRoot "assets") -Recurse -Force
}

Write-Host "==> Copying dist/ to root..." -ForegroundColor Cyan
Copy-Item -Path (Join-Path $distDir "*") -Destination $repoRoot -Recurse -Force

# ВАЖНО: index.dev.html НЕ удаляется — это шаблон, из которого Vite собирает прод-версию
# (build.rollupOptions.input = 'index.dev.html'). Без него следующая сборка упадёт.
# Файл нужен и в репозитории, чтобы собрать сайт из свежего клона.

Write-Host "==> Git add..." -ForegroundColor Cyan
& $gitExe add -A

Write-Host "==> Git status:" -ForegroundColor Cyan
& $gitExe status --short | Select-Object -First 30

Write-Host "==> Committing..." -ForegroundColor Cyan
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
& $gitExe commit -m "Deploy: update site ($timestamp)" 2>&1 | Write-Host

if ($LASTEXITCODE -ne 0) {
  Write-Host "==> Nothing to commit or commit failed" -ForegroundColor Yellow
}

if (-not $NoPush) {
  Write-Host "==> Pushing to gh-pages..." -ForegroundColor Cyan
  & $gitExe push origin gh-pages --force
  if ($LASTEXITCODE -ne 0) { throw "Push failed with exit code $LASTEXITCODE" }
  Write-Host "==> Deployed successfully!" -ForegroundColor Green
} else {
  Write-Host "==> Push skipped (--NoPush)" -ForegroundColor Yellow
}
