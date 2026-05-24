import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "@/database";

interface CupomAttributes {
  id: number;
  codigo: string;
  tipo: "percentual" | "fixo" | "frete_gratis";
  valor: number;
  ativo: boolean;
  data_expiracao?: Date | null;
  uso_maximo?: number | null;
  usos_atual: number;
  valor_minimo_pedido: number;
}

interface CupomCreation extends Optional<
  CupomAttributes,
  | "id"
  | "ativo"
  | "data_expiracao"
  | "uso_maximo"
  | "usos_atual"
  | "valor_minimo_pedido"
> {}

class Cupom extends Model<CupomAttributes, CupomCreation> {
  declare id: number;
  declare codigo: string;
  declare tipo: "percentual" | "fixo" | "frete_gratis";
  declare valor: number;
  declare ativo: boolean;
  declare data_expiracao: Date | null;
  declare uso_maximo: number | null;
  declare usos_atual: number;
  declare valor_minimo_pedido: number;

  declare createdAt: Date;
  declare updatedAt: Date;
}

Cupom.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    codigo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    tipo: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    valor: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },

    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    data_expiracao: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    uso_maximo: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    usos_atual: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    valor_minimo_pedido: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "cupons",
    timestamps: true,
  },
);

export default Cupom;
