"use strict";

/** @type {import("sequelize-cli").Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("pedido_status_logs", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      pedido_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      admin_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      status_anterior: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      status_novo: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      observacao: {
        type: Sequelize.TEXT,
        allowNull: true,
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
    await queryInterface.dropTable("pedido_status_logs");
  },
};
