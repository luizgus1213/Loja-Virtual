import { DataTypes } from "sequelize";
import sequelize from "@/database";

const Endereco = sequelize.define(
  "Endereco",
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

    rua: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    numero: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    cep: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    bairro: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    cidade: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    estado: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    complemento: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    endereco_padrao: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "enderecos",
    timestamps: true,
  },
);

export default Endereco;
