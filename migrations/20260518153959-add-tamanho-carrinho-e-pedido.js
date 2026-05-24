"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const carrinhoDescricao =
      await queryInterface.describeTable("carrinho_itens");

    if (!carrinhoDescricao.tamanho) {
      await queryInterface.addColumn("carrinho_itens", "tamanho", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    const pedidoDescricao = await queryInterface.describeTable("pedido_itens");

    if (!pedidoDescricao.tamanho) {
      await queryInterface.addColumn("pedido_itens", "tamanho", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const carrinhoDescricao =
      await queryInterface.describeTable("carrinho_itens");

    if (carrinhoDescricao.tamanho) {
      await queryInterface.removeColumn("carrinho_itens", "tamanho");
    }

    const pedidoDescricao = await queryInterface.describeTable("pedido_itens");

    if (pedidoDescricao.tamanho) {
      await queryInterface.removeColumn("pedido_itens", "tamanho");
    }
  },
};
