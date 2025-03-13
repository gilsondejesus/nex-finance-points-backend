import { Sequelize } from "sequelize";
import config from "../config/database.js";
import { User } from "./User.js";
import { Transaction } from "./Transaction.js";

const sequelize = new Sequelize(config);

User.init(sequelize);
Transaction.init(sequelize);

User.associate({ Transaction });
Transaction.associate({ User });

export { sequelize, User, Transaction };
