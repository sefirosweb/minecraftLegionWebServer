require('dotenv').config()

const config = {
    listenPort: process.env.LISTEN_PORT,
    adminPassword: process.env.ADMIN_PASSWORD,
    authJwtSecret: process.env.AUTH_JWT_SECRET
}

module.exports = config