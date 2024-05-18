import console from "console";
import express from "express";
import playwright from "playwright-core";
import process from "process";
import { asyncExpressMiddleware, defaultUserAgent } from "./utils.mjs";

if (process.env.PW_REMOTE_URL === undefined) {
  console.error("PW_REMOTE_URL is required");
  process.exit(1);
}

const browser = await playwright.chromium.connect(process.env.PW_REMOTE_URL);

console.log("connected to browser", process.env.PW_REMOTE_URL);

const app = express();

app.get(
  "/sogou",
  asyncExpressMiddleware(async (req, res) => {
    const { search } = req.query;
    const context = await browser.newContext({
      userAgent: defaultUserAgent(),
      timezoneId: "Asia/Shanghai",
      locale: "zh-CN",
    });
    const page = await context.newPage();
    await page.goto(`https://www.sogou.com/web?query=${search}`, {
      waitUntil: "domcontentloaded",
      timeout: 1000,
    });
    const results = await page.$(".results");
    const cards = await results.$$(".vrwrap");
    const refLinks = [];
    // for each links
    for (const card of cards) {
      const linkEle = await card.$("h3 a");
      if (!linkEle) continue;
      const href = await linkEle.getAttribute("href");
      const link = `https://www.sogou.com${href}`;
      const title = await linkEle.innerText();
      const description = await (await card.$(".space-txt"))?.innerText?.();
      const img = await (await card.$("img"))?.getAttribute?.("src");

      refLinks.push({
        title,
        link,
        description,
        img,
      });
    }
    await context.close();
    return res.json(refLinks);
  }),
);

app.listen(parseInt(process.env.PORT) || 3000, () => {
  console.log("Server is running");
});
