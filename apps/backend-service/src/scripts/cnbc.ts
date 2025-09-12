import puppeteer from "puppeteer";

async function fetchCNBCRssFeeds() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    timeout: 0,
  });

  const page = await browser.newPage();
  await page.goto("https://www.cnbc.com/rss-feeds/", {
    waitUntil: "networkidle0",
  });

  await delay(5000);

  const html = await page.content();
  console.log("🔍 HTML preview snippet:", html.slice(0, 1000));

  const feeds = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll("a"));
    return anchors
      .filter((a) => a.href.includes("view.xml"))
      .map((a) => ({
        title: a.innerText.trim(),
        url: a.href,
      }));
  });

  console.log("Feeds:", feeds);
  await browser.close();

  return feeds;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

fetchCNBCRssFeeds();
