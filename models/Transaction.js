import { Model, DataTypes } from "sequelize";

export class Transaction extends Model {
  static init(sequelize) {
    super.init(
      {
        description: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        transactionDate: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        pointsValue: {
          type: DataTypes.DECIMAL(10, 3),
          allowNull: false,
        },
        moneyValue: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM("Aprovado", "Reprovado", "Em avaliação"),
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: "Transaction",
        tableName: "Transactions",
        timestamps: true,
        underscored: true,
      },
    );
  }

  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
  }
}
