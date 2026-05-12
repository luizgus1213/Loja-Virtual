import { DataTypes } from "sequelize";
import sequelize from "@/database";

const Arquivo = sequelize.define(
  "Arquivo",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    link: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "arquivos",
    timestamps: true,
  },
);

export default Arquivo;
