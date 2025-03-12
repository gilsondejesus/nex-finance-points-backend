import { Model, DataTypes } from "sequelize";

class Transaction extends Model {
  static init(sequelize) {
    super.init(
      {
        description: DataTypes.STRING,
        transactionDate: DataTypes.DATE,
        pointsValue: DataTypes.DECIMAL(10, 3),
        moneyValue: DataTypes.DECIMAL(10, 2),
        status: DataTypes.ENUM("Aprovado", "Reprovado", "Em avaliação"),
      },
      { sequelize },
    );

    this.belongsTo(this.sequelize.models.User, {
      foreignKey: "user_id",
      as: "user",
    });
  }
}

export default Transaction;
