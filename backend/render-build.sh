#!/usr/bin/env bash
# Render build script for installing dependencies including Chromium for Puppeteer

echo "🔨 Installing npm dependencies..."
npm install

echo "🌐 Installing Chromium for Puppeteer..."
npx puppeteer browsers install chrome

echo "✅ Build complete!"
