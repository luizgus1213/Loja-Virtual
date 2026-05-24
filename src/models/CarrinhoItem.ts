import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "@/database";

interface CarrinhoItemAttributes {
  id: number;
  carrinho_id: number;
  produto_id: number;
  quantidade: number;
  cor: string;
  tamanho?: string | null;
}

interface CarrinhoItemCreation extends Optional<
  CarrinhoItemAttributes,
  "id" | "tamanho"
> {}

class CarrinhoItem extends Model<CarrinhoItemAttributes, CarrinhoItemCreation> {
  declare id: number;
  declare carrinho_id: number;
  declare produto_id: number;
  declare quantidade: number;
  declare cor: string;
  declare tamanho: string | null;

  declare createdAt: Date;
  declare updatedAt: Date;
}

CarrinhoItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    carrinho_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    produto_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    quantidade: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    cor: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    tamanho: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "carrinho_itens",
    timestamps: true,
  },
);

export default CarrinhoItem;
