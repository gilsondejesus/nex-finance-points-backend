require("dotenv").config();

module.exports = {
  development: {
    dialect: "mysql",
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    define: {
      timestamps: true,
      underscored: true,
    },
    logging: console.log,
    timezone: "-03:00",
  },
};
