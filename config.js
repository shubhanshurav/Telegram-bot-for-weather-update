require("dotenv").config();

module.exports = {
  botToken: process.env.BOT_TOKEN,
  weatherApiKey: process.env.WEATHER_API_KEY,
  // admins: new Set([process.env.TELEGRAM_ID]),
  admins: new Set([1543059186]),
};
