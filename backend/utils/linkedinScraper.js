const puppeteer = require('puppeteer');

/**
 * Scrapes LinkedIn profile data using Puppeteer
 * @param {string} profileUrl - LinkedIn profile URL
 * @returns {Promise<Object>} Scraped profile data
 */
async function scrapeLinkedInProfile(profileUrl) {
  let browser = null;

  try {
    console.log('🌐 Launching browser to scrape LinkedIn profile...');

    // Find Chrome executable path (works on Render after install)
    let executablePath;
    try {
      executablePath = puppeteer.executablePath();
    } catch (error) {
      console.log('⚠️  Using default Chrome path');
    }

    browser = await puppeteer.launch({
      headless: true,
      executablePath: executablePath || process.env.PUPPETEER_EXECUTABLE_PATH,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-blink-features=AutomationControlled',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ]
    });

    const page = await browser.newPage();

    // Set viewport and additional headers
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
    });

    console.log('🔍 Navigating to LinkedIn profile:', profileUrl);

    // Navigate to the profile
    await page.goto(profileUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait a bit for dynamic content to load
    await page.waitForTimeout(3000);

    console.log('📊 Extracting profile data...');

    // Extract profile data
    const profileData = await page.evaluate(() => {
      const data = {
        fullName: '',
        headline: '',
        location: '',
        about: '',
        experience: [],
        education: [],
        skills: [],
        certifications: [],
        languages: [],
        profilePictureUrl: '',
        bannerImageUrl: ''
      };

      // Helper function to safely get text content
      const getText = (selector) => {
        const element = document.querySelector(selector);
        return element ? element.textContent.trim() : '';
      };

      const getTexts = (selector) => {
        const elements = document.querySelectorAll(selector);
        return Array.from(elements).map(el => el.textContent.trim()).filter(Boolean);
      };

      // Extract full name
      data.fullName = getText('h1.text-heading-xlarge') ||
                      getText('h1.inline') ||
                      getText('.pv-text-details__left-panel h1') ||
                      getText('.ph5 h1');

      // Extract headline
      data.headline = getText('.text-body-medium') ||
                      getText('.pv-text-details__left-panel .text-body-medium') ||
                      getText('.ph5 .text-body-medium');

      // Extract location
      data.location = getText('.text-body-small.inline') ||
                      getText('.pv-text-details__left-panel .text-body-small') ||
                      getText('.ph5 .text-body-small');

      // Extract about section
      data.about = getText('.pv-about-section .pv-about__summary-text') ||
                   getText('.pv-about__summary-text') ||
                   getText('#about ~ .pvs-list__outer-container .display-flex span') ||
                   getText('.inline-show-more-text span[aria-hidden="true"]');

      // Extract experience
      const experienceItems = document.querySelectorAll('#experience ~ .pvs-list__outer-container li, .pv-profile-section__card-item');
      experienceItems.forEach(item => {
        const title = item.querySelector('.mr1.hoverable-link-text span[aria-hidden="true"]') ||
                     item.querySelector('.t-bold span[aria-hidden="true"]');
        const company = item.querySelector('.t-14.t-normal span[aria-hidden="true"]') ||
                       item.querySelector('.pv-entity__secondary-title');
        const duration = item.querySelector('.t-14.t-black--light span[aria-hidden="true"]') ||
                        item.querySelector('.pv-entity__date-range span:nth-child(2)');
        const description = item.querySelector('.pv-entity__description') ||
                          item.querySelector('.inline-show-more-text span[aria-hidden="true"]');

        if (title && title.textContent.trim()) {
          data.experience.push({
            title: title.textContent.trim(),
            company: company ? company.textContent.trim() : '',
            duration: duration ? duration.textContent.trim() : '',
            description: description ? description.textContent.trim() : ''
          });
        }
      });

      // Extract education
      const educationItems = document.querySelectorAll('#education ~ .pvs-list__outer-container li, .pv-education-entity');
      educationItems.forEach(item => {
        const school = item.querySelector('.mr1.hoverable-link-text span[aria-hidden="true"]') ||
                      item.querySelector('.pv-entity__school-name');
        const degree = item.querySelector('.t-14.t-normal span[aria-hidden="true"]') ||
                      item.querySelector('.pv-entity__degree-name');
        const years = item.querySelector('.t-14.t-black--light span[aria-hidden="true"]') ||
                     item.querySelector('.pv-entity__dates span:nth-child(2)');

        if (school && school.textContent.trim()) {
          data.education.push({
            school: school.textContent.trim(),
            degree: degree ? degree.textContent.trim() : '',
            years: years ? years.textContent.trim() : ''
          });
        }
      });

      // Extract skills
      const skillItems = document.querySelectorAll('#skills ~ .pvs-list__outer-container li span[aria-hidden="true"]');
      data.skills = Array.from(skillItems).slice(0, 10).map(el => el.textContent.trim()).filter(Boolean);

      // Extract profile picture
      const profileImg = document.querySelector('.pv-top-card-profile-picture__image') ||
                        document.querySelector('img.pv-top-card-profile-picture__image--show');
      if (profileImg && profileImg.src) {
        data.profilePictureUrl = profileImg.src;
      }

      // Get page text for AI analysis
      data.rawText = document.body.innerText.slice(0, 15000);

      return data;
    });

    console.log('✅ Profile data extracted successfully');
    console.log('👤 Name:', profileData.fullName);
    console.log('💼 Headline:', profileData.headline);
    console.log('📍 Location:', profileData.location);
    console.log('💼 Experience entries:', profileData.experience.length);
    console.log('🎓 Education entries:', profileData.education.length);
    console.log('🔧 Skills found:', profileData.skills.length);

    await browser.close();
    return profileData;

  } catch (error) {
    console.error('❌ Error scraping LinkedIn profile:', error.message);
    if (browser) await browser.close();

    // Return fallback data if scraping fails
    return {
      fullName: 'Profile User',
      headline: '',
      location: '',
      about: '',
      experience: [],
      education: [],
      skills: [],
      error: error.message,
      rawText: ''
    };
  }
}

module.exports = { scrapeLinkedInProfile };
