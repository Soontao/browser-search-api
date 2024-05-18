import console from "console";
import express from "express";
import process from "process";
import puppeteer from "puppeteer-core";
import { asyncExpressMiddleware, defaultUserAgent } from "./utils.mjs";

if (process.env.PW_REMOTE_URL === undefined) {
  console.error("PW_REMOTE_URL is required");
  process.exit(1);
}

const app = express();

app.get(
  "/sogou",
  asyncExpressMiddleware(async (req, res) => {
    const { search } = req.query;
    const browser = await puppeteer.connect({
      browserWSEndpoint: process.env.PW_REMOTE_URL,
    });
    const page = await browser.newPage();
    await page.setUserAgent(defaultUserAgent());
    await page.goto(`https://www.sogou.com/web?query=${search}`, {
      waitUntil: "load",
      referer: "https://www.sogou.com/",
    });
    const results = await page.$(".results");
    const cards = await results.$$(".vrwrap");
    const refLinks = await Promise.all(
      cards.map((card) => {
        return card.evaluate((node) => {
          const linkEle = node.querySelector("h3 a");
          if (!linkEle) return;
          const link = linkEle.href;
          // get text
          const title = linkEle.innerText;
          const description = node.querySelector(".space-txt")?.innerText;
          const img = node.querySelector("img")?.src;
          return {
            title,
            link,
            description,
            img,
          };
        });
      }),
    );
    await browser.close();
    return res.json(refLinks.filter(Boolean));
  }),
);

app.listen(parseInt(process.env.PORT) || 3000, () => {
  console.log("Server is running");
});
