const axios = require("axios");
const cheerio = require("cheerio");

const URL = "https://l-tike.com/st1/l-web-gs_mlts2025/sitetop";
const { LINE_NOTIFY_TOKEN } = process.env;

async function checkTicketStatus() {
  try {
    const response = await axios.get(URL, {
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    const $ = cheerio.load(response.data);

    if ($("body").text().includes("発売中")) {
      await sendLineNotification("チケットが発売されたかも！")
    } else {
      await sendLineNotification("チケットがない！")
    }
  } catch (error) {
    console.error(`エラー: ${error.message}`);
  }
}

const sendLineNotification = async (message) => {
  try {
    await axios.post(
      "https://notify-api.line.me/api/notify",
      new URLSearchParams({ message }),
      {
        headers: {
          Authorization: `Bearer ${LINE_NOTIFY_TOKEN}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
  } catch (error) {
    console.error("LINE通知の送信中にエラーが発生しました:", error);
  }
};

checkTicketStatus();
