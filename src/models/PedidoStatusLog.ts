import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "@/database";

interface PedidoStatusLogAttributes {
  id: number;
  pedido_id: number;
  admin_id: number;
  status_anterior: string;
  status_novo: string;
  observacao?: string | null;
}

interface PedidoStatusLogCreation extends Optional<
  PedidoStatusLogAttributes,
  "id" | "observacao"
> {}

class PedidoStatusLog extends Model<
  PedidoStatusLogAttributes,
  PedidoStatusLogCreation
> {
  declare id: number;
  declare pedido_id: number;
  declare admin_id: number;
  declare status_anterior: string;
  declare status_novo: string;
  declare observacao: string | null;

  declare createdAt: Date;
  declare updatedAt: Date;
}

PedidoStatusLog.init(
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

    admin_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    status_anterior: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    status_novo: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    observacao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "pedido_status_logs",
    timestamps: true,
  },
);

export default PedidoStatusLog;
