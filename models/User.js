import { Model, DataTypes } from "sequelize";

export class User extends Model {
  static init(sequelize) {
    super.init(
      {
        name: {
          type: DataTypes.STRING,
          allowNull: false
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true
          }
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false
        },
        cpf: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: {
            len: [14, 14],  // Formato 000.000.000-00
            is: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
          }
        },
        role: {
          type: DataTypes.ENUM("user", "admin"),
          defaultValue: "user",
          allowNull: false
        }
      },
      {
        sequelize,
        modelName: "User",
        tableName: "users",
        timestamps: true,
        underscored: true,
        paranoid: false
      }
    );
  }

  static associate(models) {
    this.hasMany(models.Transaction, {
      foreignKey: "user_id",
      as: "transactions",
    });
  }
}