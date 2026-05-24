import { DataTypes } from "sequelize";
import sequelize from "@/database";
import Arquivo from "./Arquivo";
import Endereco from "./Endereco";
import Favorito from "./Favorito";

const User = sequelize.define(
  "User",
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

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    email_verificado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    codigo_verificacao: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    email_pendente: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    senha: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    cpf: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },

    cpf_verificado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    numero_telefone: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },

    foto_perfil_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    acesso: {
      type: DataTypes.ENUM("admin", "user"),
      defaultValue: "user",
    },

    tema_preferido: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "dark",
    },

    notificar_pedidos: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    notificar_promocoes: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    notificar_seguranca: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    token_version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    conta_desativada: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "users",
    timestamps: true,
  },
);

Endereco.belongsTo(User, {
  as: "user",
  foreignKey: "user_id",
});

User.hasMany(Endereco, {
  as: "enderecos",
  foreignKey: "user_id",
});

User.belongsTo(Arquivo, {
  as: "foto_perfil",
  foreignKey: "foto_perfil_id",
});

User.hasMany(Favorito, {
  foreignKey: "user_id",
  as: "favoritos",
});

export default User;
