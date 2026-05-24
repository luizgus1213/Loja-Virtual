import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "@/database";

interface PedidoAttributes {
  id: number;
  user_id: number;

  total_produtos: number;
  frete_valor: number;
  frete_tipo: string | null;

  cupom_id: number | null;
  desconto_valor: number;

  endereco_id: number | null;

  total: number;
  status: string;
  expiresAt: Date | null;

  createdAt?: Date;
  updatedAt?: Date;
}

interface PedidoCreation extends Optional<
  PedidoAttributes,
  | "id"
  | "total_produtos"
  | "frete_valor"
  | "frete_tipo"
  | "cupom_id"
  | "desconto_valor"
  | "endereco_id"
  | "expiresAt"
  | "createdAt"
  | "updatedAt"
> {}

class Pedido extends Model<PedidoAttributes, PedidoCreation> {
  declare id: number;
  declare user_id: number;

  declare total_produtos: number;
  declare frete_valor: number;
  declare frete_tipo: string | null;

  declare cupom_id: number | null;
  declare desconto_valor: number;

  declare endereco_id: number | null;

  declare total: number;
  declare status: string;
  declare expiresAt: Date | null;

  declare createdAt: Date;
  declare updatedAt: Date;
}

Pedido.init(
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

    total_produtos: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },

    frete_valor: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },

    frete_tipo: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    cupom_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    desconto_valor: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },

    endereco_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    total: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "aguardando_pagamento",
    },

    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "pedidos",
    timestamps: true,
  },
);

export default Pedido;
