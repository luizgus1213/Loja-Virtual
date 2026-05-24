"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("carrinho_itens", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      carrinho_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      produto_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      quantidade: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      cor: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("carrinho_itens");
  },
};
