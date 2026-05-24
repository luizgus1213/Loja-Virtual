import { DataTypes } from "sequelize";
import sequelize from "@/database";

const Notificacao = sequelize.define(
  "Notificacao",
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

    tipo: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    mensagem: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    link: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    lida: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "notificacoes",
    timestamps: true,
  },
);

export default Notificacao;
