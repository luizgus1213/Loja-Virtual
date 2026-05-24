import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";

import sequelize from "@/database";
import Arquivo from "./Arquivo";

class Product extends Model<
  InferAttributes<Product>,
  InferCreationAttributes<Product>
> {
  declare id: CreationOptional<number>;

  declare nome: string;
  declare marca: string;
  declare categoria: string;
  declare descricao: string;

  declare preco: number;
  declare avaliacao: number;
  declare estoque: number;

  declare imagem_id: number | null;
  declare estoque_reservado: number;
}

Product.init(
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
      allowNull: true,
    },

    estoque_reservado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "produtos",
    timestamps: true,
  },
);
Product.belongsTo(Arquivo, {
  foreignKey: "imagem_id",
  as: "imagem",
});

export default Product;
