import { DataTypes } from "sequelize";
import sequelize from "@/database";
import Arquivo from "./Arquivo";

const Product = sequelize.define(
  "Produto",
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
    marca: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    categoria: {
      type: DataTypes.STRING,
    },
    descricao: {
      type: DataTypes.STRING,
    },
    preco: {
      type: DataTypes.FLOAT,
    },
    avaliacao: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    estoque: {
      type: DataTypes.INTEGER,
    },

    imagem_id: {
      type: DataTypes.INTEGER,
    },
    // imagem: {
    //   type: DataTypes.STRING,
    // },
  },
  {
    tableName: "produtos",
    timestamps: true,
  },
);

Product.belongsTo(Arquivo, {
  as: "imagem",
  foreignKey: "imagem_id",
});

export default Product;
