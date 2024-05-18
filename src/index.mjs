import console from "console";
import express from "express";
import playwright from "playwright-core";
import process from "process";
import TurndownService from "turndown";

const turndownService = new TurndownService();

if (process.env.PW_REMOTE_URL === undefined) {
  console.error("PW_REMOTE_URL is required");
  process.exit(1);
}

const browser = await playwright.chromium.connect(process.env.PW_REMOTE_URL);

console.log("connected to browser", process.env.PW_REMOTE_URL);

const app = express();

app.get("/sogou", async (req, res) => {
  const { search } = req.query;
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`https://www.sogou.com/web?query=${search}`, {
    waitUntil: "domcontentloaded",
    timeout: 3000,
  });
  const results = await page.$(".results");
  return res.end(turndownService.turndown(await results.innerHTML()));
});

app.listen(parseInt(process.env.PORT) || 3000, () => {
  console.log("Server is running");
});
