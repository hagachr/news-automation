const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { Dropbox } = require('dropbox');
const fetch = require('node-fetch'); // required by Dropbox SDK in Node
const dropbox = new Dropbox({
  accessToken: process.env.DROPBOX_TOKEN,
  fetch
});


const urls = [
  'https://deadline.com',
  'https://deadline.com/page/2/',
  'https://deadline.com/page/3/',
  'https://deadline.com/page/4/',
  'https://variety.com',
  'https://variety.com/page/2/',
  'https://variety.com/page/3/',
  'https://variety.com/page/4/',
  'https://www.hollywoodreporter.com/',
  'https://www.hollywoodreporter.com/c/news/',
  'https://www.hollywoodreporter.com/c/movies/',
  'https://www.hollywoodreporter.com/c/tv/',
  'https://tvline.com/',
  'https://www.thewrap.com',
  'https://www.nytimes.com',
  'https://www.washingtonpost.com',
  'https://apnews.com/',
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
  'https://www.theverge.com/',
  'https://www.404media.co/',
  'https://www.wired.com/'
  'https://www.theinformation.com/',
  'https://arstechnica.com/',
  'https://techcrunch.com/latest/',
  'https://techcrunch.com/latest/page/2/',
  'https://www.engadget.com/',
  'https://www.engadget.com/page/2/',
  'https://www.macrumors.com/',
  'https://torrentfreak.com/',
  'https://www.propublica.org/',
  'https://www.axios.com/',
  'https://edition.cnn.com/',
  'https://www.vox.com/',
  'https://puck.news/',
  'https://www.ft.com/',
  'https://theintercept.com/',
  'https://www.theguardian.com/europe',
  'https://www.bloomberg.com/europe',
  'https://www.bloomberg.com/opinion',
  'https://www.bloomberg.com/latest',
  'https://www.bloomberg.com/ai',
  'https://www.bloomberg.com/technology/cybersecurity',
  'https://www.bloomberg.com/screentime',
  'https://www.semafor.com/',
  'https://www.cnbc.com/world/',
  'https://www.cnbc.com/business/',
  'https://www.cnbc.com/technology/',
  'https://www.cnbc.com/politics/',
  'https://www.cnbc.com/pro/',
  'https://www.politico.com/',
  'https://www.politico.com/section/magazine',
  'https://time.com/',
  'https://www.rollingstone.com/',
  'https://www.businessinsider.com/',
  'https://www.thedailybeast.com/',
  'https://www.thedailybeast.com/category/media/',
  'https://www.thedailybeast.com/category/politics/',
  'https://www.thedailybeast.com/category/politics/opinion/',
  'https://www.thedailybeast.com/category/innovation/',
  'https://www.thedailybeast.com/category/us-news/',
  'https://www.statnews.com/'
  'https://www.statnews.com/latest/',
  'https://www.lawfaremedia.org/',
  'https://www.adweek.com/',
  'https://foreignpolicy.com/',
  'https://www.foreignaffairs.com/',
  'https://www.theatlantic.com/world/',
  'https://www.newyorker.com/',
  'https://www.economist.com/',
  'https://theconversation.com/europe',
  'https://theconversation.com/us',
  'https://thehill.com/',
  'https://thehill.com/opinion/',
  'https://www.npr.org/',
  'https://www.bbc.com/',
  'https://abcnews.go.com/',
  'https://www.cbsnews.com/',
  'https://www.nbcnews.com/',
  'https://www.thecut.com/',
  'https://nymag.com/intelligencer/',
  'https://www.vulture.com/',
  'https://www.vanityfair.com/',
  'https://mashable.com/',
  'https://www.them.us/',
  'https://slate.com/news-and-politics',
  'https://slate.com/culture',
  'https://slate.com/technology',
  'https://slate.com/business',
  'https://slate.com/life',
  'https://slate.com/advice',
  'https://www.teenvogue.com/'
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
const uploadToDropbox = async () => {
  // Upload JSON
  const jsonData = fs.readFileSync('headlines.json');
  await dropbox.filesUpload({
    path: `/NewsScraper/headlines-${new Date().toISOString().split('T')[0]}.json`,
    contents: jsonData,
    mode: 'overwrite'
  });

  // Upload screenshots
  const files = fs.readdirSync('screenshots');
  for (const file of files) {
    const filePath = `screenshots/${file}`;
    const content = fs.readFileSync(filePath);
    await dropbox.filesUpload({
      path: `/NewsScraper/${file}`,
      contents: content,
      mode: 'overwrite'
    });
  }
};

await uploadToDropbox();
console.log('Uploaded to Dropbox ✅');

})();
