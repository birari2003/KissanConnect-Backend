require('dotenv').config();
const fs = require('fs');

const config = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: process.env.DB_DIALECT,
  dialectOptions: {
    charset: 'utf8mb4'
  }
};

if (process.env.DB_SSL_CA) {
  config.dialectOptions.ssl = {
    ca: fs.readFileSync(process.env.DB_SSL_CA)
  };
}

module.exports = {
  development: config
};
