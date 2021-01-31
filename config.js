require('dotenv').config()

const config = {
    adminPassword = process.env.DEFAULT_ADMIN_PASSWORD,
    authJwtSecret = process.env.AUTH_JWT_SECRET
}

module.exports = { config }