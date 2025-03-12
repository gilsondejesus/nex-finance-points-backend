import { Sequelize } from "sequelize";
import config from "../config/database.js";

const sequelize = new Sequelize(config);

import User from "./User.js";
import Transaction from "./Transaction.js";

User.initModel(sequelize);
Transaction.initModel(sequelize);

User.associate(sequelize.models);
Transaction.associate(sequelize.models);

export { sequelize, User, Transaction };
