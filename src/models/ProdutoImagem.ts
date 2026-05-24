import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";

import sequelize from "@/database";

class ProdutoImagem extends Model<
  InferAttributes<ProdutoImagem>,
  InferCreationAttributes<ProdutoImagem>
> {
  declare id: CreationOptional<number>;

  declare produto_id: number;

  declare arquivo_id: number;

  declare principal: boolean;

  declare ordem: number;
}

ProdutoImagem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    produto_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    arquivo_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    principal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    ordem: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "produto_imagens",
    timestamps: true,
  },
);

export default ProdutoImagem;
