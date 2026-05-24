"use strict";

/** @type {import("sequelize-cli").Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("notificacoes", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      tipo: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      titulo: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      mensagem: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      link: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      lida: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
    await queryInterface.dropTable("notificacoes");
  },
};
