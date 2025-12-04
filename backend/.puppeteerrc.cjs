const { join } = require('path');

/**
 * Puppeteer configuration for Render deployment
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Use the default cache directory that Render provides
  cacheDirectory: process.env.PUPPETEER_CACHE_DIR || join(__dirname, '.cache', 'puppeteer'),
};
