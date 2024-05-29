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
  "/bing",
  createCommonSearchAPI({
    urlPrefix: "https://cn.bing.com/search?q=",
    resultsItemSelector: "#b_results .b_algo",
    titleSelector: ".b_tpcn a",
    linkSelector: ".b_tpcn a",
    descriptionSelector: ".tptxt",
  }),
);

app.listen(parseInt(process.env.PORT) || 3000, () => {
  console.log("Server is running");
});
