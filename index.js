const axios = require("axios");
const cheerio = require("cheerio");
require("dotenv").config();

const URL = "https://eplus.jp/sf/detail/0260360001";

async function checkTicketStatus() {
  try {
    const response = await axios.get(URL, {
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    const $ = cheerio.load(response.data);

    const keyword = "予定枚数終了";
    const occurrences = $("body").text().split(keyword).length - 1;

    if (occurrences < 20) {
      await sendLineNotification("「予定枚数終了」の文言が規定値以下になりました！");
    }
  } catch (error) {
    console.error(`エラー: ${error.message}`);
  }
}

checkTicketStatus();
