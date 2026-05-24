import { DataTypes } from "sequelize";
import sequelize from "@/database";

const Avaliacao = sequelize.define(
  "Avaliacao",
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

    pedido_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    nota: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },

    comentario: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "avaliacoes",
    timestamps: true,
  },
);

export default Avaliacao;
