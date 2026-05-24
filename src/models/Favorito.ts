import { DataTypes } from "sequelize";
import sequelize from "@/database";

const Favorito = sequelize.define(
  "Favorito",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    produto_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "favoritos",
    timestamps: true,
  },
);

export default Favorito;
