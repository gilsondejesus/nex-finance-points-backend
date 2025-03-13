import dotenv from "dotenv";
dotenv.config();

export default {
  dialect: "mysql",
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  define: {
    timestamps: true,
    underscored: true,
  },
  timezone: "-03:00",
  dialectOptions: {
    decimalNumbers: true,
  },
};
