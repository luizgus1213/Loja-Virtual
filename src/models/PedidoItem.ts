import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "@/database";

interface PedidoItemAttributes {
  id: number;
  pedido_id: number;
  produto_id: number;
  quantidade: number;
  preco_unitario: number;
  cor: string;
  tamanho?: string | null;
}

interface PedidoItemCreation extends Optional<
  PedidoItemAttributes,
  "id" | "tamanho"
> {}

class PedidoItem extends Model<PedidoItemAttributes, PedidoItemCreation> {
  declare id: number;
  declare pedido_id: number;
  declare produto_id: number;
  declare quantidade: number;
  declare preco_unitario: number;
  declare cor: string;
  declare tamanho: string | null;

  declare createdAt: Date;
  declare updatedAt: Date;
}

PedidoItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    pedido_id: {
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
    },

    preco_unitario: {
      type: DataTypes.FLOAT,
      allowNull: false,
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
    tableName: "pedido_itens",
    timestamps: true,
  },
);

export default PedidoItem;
