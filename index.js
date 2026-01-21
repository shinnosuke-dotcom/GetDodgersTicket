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
      await sendLine("イープラスの状況が変わりました！"+"\n"+URL);
      console.log("通知を送信しました。");
    }
  } catch (error) {
    console.error(`エラー: ${error.message}`);
  }
}

const ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const LINE_USER_ID = process.env.LINE_USER_ID;

async function sendLine(message) {
  const res = await fetch(
    "https://api.line.me/v2/bot/message/broadcast",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        "messages":[
          {
              "type":"text",
              "text": message
          }
      ]
      }),
    }
  );
}

checkTicketStatus();
