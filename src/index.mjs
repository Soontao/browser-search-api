import console from "console";
import express from "express";
import process from "process";
import { createCommonSearchAPI } from "./utils.mjs";

if (process.env.PW_REMOTE_URL === undefined) {
  console.error("PW_REMOTE_URL is required");
  process.exit(1);
}

const app = express();

app.get(
  "/sogou",
  createCommonSearchAPI({
    urlPrefix: "https://www.sogou.com/web?query=",
    resultsItemSelector: ".results .vrwrap",
    titleSelector: "h3 a",
    linkSelector: "h3 a",
    descriptionSelector: ".space-txt",
  }),
);

app.get(
  "/weixin",
  createCommonSearchAPI({
    urlPrefix: "https://weixin.sogou.com/weixin?type=2&query=",
    resultsItemSelector: ".news-box .news-list li",
    titleSelector: "h3 a",
    linkSelector: "h3 a",
    descriptionSelector: ".txt-info",
  }),
);

app.get(
  "/zhihu",
  createCommonSearchAPI({
    urlPrefix: "https://sogou.com/web?insite=zhihu.com&query=",
    resultsItemSelector: ".results .vrwrap",
    titleSelector: "h3 a",
    linkSelector: "h3 a",
    descriptionSelector: ".str-text-info",
  }),
);

app.get(
  "/baike",
  createCommonSearchAPI({
    urlPrefix: "https://sogou.com/web?insite=baike.baidu.com&query=",
    resultsItemSelector: ".results .vrwrap",
    titleSelector: "h3 a",
    linkSelector: "h3 a",
    descriptionSelector: ".str-text-info",
  }),
);

app.get(
  "/bing",
  createCommonSearchAPI({
    urlPrefix: "https://cn.bing.com/search?q=",
    resultsItemSelector: "#b_content #b_results li.b_algo",
    titleSelector: "h2 a",
    linkSelector: "h2 a",
    descriptionSelector: ".b_caption, p.b_algoSlug",
  }),
);

app.listen(parseInt(process.env.PORT) || 3000, () => {
  console.log("Server is running");
});
