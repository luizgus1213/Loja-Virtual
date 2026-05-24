"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("pedido_itens", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      pedido_id: {
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

      preco_unitario: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },

      cor: {
        type: Sequelize.STRING,
        allowNull: false,
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
    await queryInterface.dropTable("pedido_itens");
  },
};
