const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
require("dotenv").config();

const URL1 = "https://tradead.tixplus.jp/wbc2026";
const URL2 = "https://eplus.jp/sf/detail/0260360001";
const ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

async function checkTicketStatus1() {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    await page.goto(URL1, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // JS実行後のテキストを取得
    const text = await page.evaluate(() => document.body.innerText);    
    const patterns = [
      /6\n金\n19:00\n0件/g,
      /7\n土\n19:00\n0件/g,
      /8\n日\n19:00\n0件/g,
      /10\n火\n19:00\n0件/g,
    ];
    const matchCount = patterns.filter((regex) => (text.match(regex) || []).length > 0).length;

    if (matchCount < 4) {
      await sendLine(
      `【WBC2026 リセール通知】出品された可能性があります。\n${URL1}`
      );
      console.log("通知を送信しました。");
    }
  } catch (error) {
    console.error("エラー:", error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function checkTicketStatus2() {
  try {
    const response = await axios.get(URL2, {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    const $ = cheerio.load(response.data);

    const keyword = "予定枚数終了";
    const occurrences = $("body").text().split(keyword).length - 1;

    if (occurrences < 20) {
      await sendLine("イープラスの状況が変わりました！" + "\n" + URL2);
      console.log("通知を送信しました。");
    }
  } catch (error) {
    console.error(`エラー: ${error.message}`);
    throw new Error("チケット状況の確認に失敗しました");
  }
}

async function sendLine(message) {
  await fetch("https://api.line.me/v2/bot/message/broadcast", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      messages: [
        {
          type: "text",
          text: message,
        },
      ],
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("LINE通知に失敗しました");
      }
    })
    .catch((error) => {
      throw new Error(error.message);
    });
}

checkTicketStatus1();
checkTicketStatus2();
