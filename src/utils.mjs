import axios from "axios";
import console from "console";
import process from "process";
import puppeteer from "puppeteer-core";

/**
 *
 * @param {import("express").RequestHandler} fn
 * @returns
 */
export function asyncExpressMiddleware(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      console.error(error.message, error.stack);
      res.status(500).json({ error: error.message });
    });
  };
}

/**
 *
 * @param {{
 *  urlPrefix: string
 *  resultsItemSelector: string,
 *  titleSelector: string,
 *  linkSelector: string,
 *  descriptionSelector: string
 * }} options
 * @returns
 */
export function createCommonSearchAPI(options) {
  return asyncExpressMiddleware(async (req, res) => {
    const { search } = req.query;
    if (!search) {
      return res.status(400).json({ error: "search query is required" });
    }
    const browser = await puppeteer.connect({
      browserWSEndpoint: process.env.PW_REMOTE_URL,
    });
    const page = await browser.newPage();
    await page.setUserAgent(defaultUserAgent());

    await page.goto(`${options.urlPrefix}${search}`, {
      waitUntil: "networkidle0",
      timeout: 30_000,
      referer: "https://cn.bing.com/",
    });

    const cards = await page.$$(options.resultsItemSelector);

    const searchResults = await Promise.all(
      cards.map(async (card) => {
        const item = await card.evaluate((node, options) => {
          const linkEle = node.querySelector(options.linkSelector);
          const link = linkEle?.href;
          const title = node.querySelector(options.titleSelector)?.innerText;
          const description = node.querySelector(
            options.descriptionSelector,
          )?.innerText;
          return {
            title,
            link,
            description,
          };
        }, options);
        if (!item?.link) return;
        if (!process.env.TF_URL) {
          console.warn("TF_URL is not set, skipping text extraction");
          return item;
        }
        try {
          const res = await axios.post(
            process.env.TF_URL + "/extract",
            { url: item.link },
            {
              headers: {
                "Content-Type": "application/json",
                "User-Agent": defaultUserAgent(),
              },
              timeout: 5_000,
            },
          );
          if (res.status < 300 && res.data?.text) {
            return { ...item, text: res.data };
          }
        } catch (error) {
          console.error("Failed to extract text", error.message, item.link);
        }

        return item;
      }),
    );
    await browser.close();
    return res.json(searchResults.filter(Boolean));
  });
}

export function defaultUserAgent() {
  return "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36";
}
