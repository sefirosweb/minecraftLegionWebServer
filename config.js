require("dotenv").config();

const config = {
  listenPort: process.env.LISTEN_PORT,
  adminPassword: process.env.ADMIN_PASSWORD,
  webClient: process.env.WEB_CLIENT,
  debug: process.env.DEBUG == "true" ? true : false,
};

module.exports = config;
