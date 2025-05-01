const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const urls = [
  'https://deadline.com',
  'https://variety.com',
  'https://www.thewrap.com',
  'https://www.nytimes.com',
  'https://www.washingtonpost.com',
  'https://www.reuters.com',
  'https://www.reuters.com/world/',
  'https://www.reuters.com/business/',
  'https://www.reuters.com/legal/',
  'https://www.reuters.com/breakingviews/',
  'https://www.reuters.com/technology/',
  'https://www.reuters.com/investigations/',
  'https://www.reuters.com/science/',
  'https://www.reuters.com/lifestyle/',
  'https://www.wsj.com',
  'https://www.wsj.com/tech'
];

(async () => {
  const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
  const page = await browser.newPage();

  if (!fs.existsSync('screenshots')) fs.mkdirSync('screenshots');

  const results = [];

  for (const url of urls) {
    try {
      console.log(`Processing ${url}`);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

      const headlines = await page.evaluate(() => {
        const elements = document.querySelectorAll('h1, h2, h3');
        return Array.from(elements).map(el => el.innerText.trim()).filter(text => text.length > 5);
      });

      const hostname = new URL(url).hostname.replace(/\./g, '_');
      await page.screenshot({ path: `screenshots/${hostname}.png`, fullPage: true });

      results.push({ url, headlines });
    } catch (err) {
      console.error(`Error with ${url}:`, err.message);
    }
  }

  fs.writeFileSync('headlines.json', JSON.stringify(results, null, 2));
  console.log('Scraping complete!');

  await browser.close();
})();
