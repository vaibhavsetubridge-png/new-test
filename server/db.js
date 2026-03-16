const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions:
    process.env.RENDER
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {},
  logging: false,
});

const Item = require("./models/Item")(sequelize);

module.exports = { sequelize, Item };
