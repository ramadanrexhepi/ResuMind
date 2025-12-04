#!/usr/bin/env bash
# Render build script for installing dependencies including Chromium for Puppeteer

set -e  # Exit on error

echo "🔨 Installing npm dependencies..."
npm install

echo "🌐 Installing Chromium for Puppeteer..."
npx puppeteer browsers install chrome

echo "🔍 Verifying Chrome installation..."
if command -v chrome &> /dev/null; then
  echo "✓ Chrome found in PATH"
  chrome --version
else
  echo "ℹ️  Chrome not in PATH (this is normal, Puppeteer uses its own Chrome)"
fi

# Show Puppeteer cache directory
echo "📁 Puppeteer cache directory: ${PUPPETEER_CACHE_DIR:-/opt/render/.cache/puppeteer}"
ls -la ${PUPPETEER_CACHE_DIR:-/opt/render/.cache/puppeteer} || echo "Cache directory not found"

echo "✅ Build complete!"
