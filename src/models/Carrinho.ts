import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";

import sequelize from "@/database";
import User from "./User";

class Carrinho extends Model<
  InferAttributes<Carrinho>,
  InferCreationAttributes<Carrinho>
> {
  declare id: CreationOptional<number>;

  declare user_id: number;
}

Carrinho.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "carrinhos",
    timestamps: true,
  },
);

Carrinho.belongsTo(User, {
  foreignKey: "user_id",
});

export default Carrinho;
