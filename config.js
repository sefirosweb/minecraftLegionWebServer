require("dotenv").config();

const config = {
  listenPort: process.env.LISTEN_PORT,
  adminPassword: process.env.ADMIN_PASSWORD,
  webClient: process.env.WEB_CLIENT,
  debug: true,
};

module.exports = config;
