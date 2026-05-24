"use strict";

/** @type {import("sequelize-cli").Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("cupons", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      codigo: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      tipo: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      valor: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },

      ativo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      data_expiracao: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      uso_maximo: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      usos_atual: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      valor_minimo_pedido: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("cupons");
  },
};
