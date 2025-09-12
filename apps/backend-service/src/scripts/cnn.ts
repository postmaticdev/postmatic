import puppeteer from "puppeteer";

async function fetchCNNRssFeeds() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    timeout: 0,
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
  );

  await page.goto("https://edition.cnn.com/services/rss/", {
    waitUntil: "networkidle0",
    timeout: 0,
  });

  await delay(3000); // waktu ekstra render

  const feeds = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("a"))
      .filter((a) => a.href.includes(".rss") || a.href.includes("rss.xml"))
      .map((a) => ({
        title: a.innerText.trim(),
        url: a.href,
      }));
  });

  console.log("📡 CNN RSS Feeds Found:", feeds.length);
  console.table(feeds);

  await browser.close();
  return feeds;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

fetchCNNRssFeeds();
