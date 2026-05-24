"use strict";

/** @type {import("sequelize-cli").Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tabela = await queryInterface.describeTable("pedidos");

    if (!tabela.frete_tipo) {
      await queryInterface.addColumn("pedidos", "frete_tipo", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (!tabela.frete_valor) {
      await queryInterface.addColumn("pedidos", "frete_valor", {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      });
    }

    if (!tabela.endereco_id) {
      await queryInterface.addColumn("pedidos", "endereco_id", {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }

    if (!tabela.total_produtos) {
      await queryInterface.addColumn("pedidos", "total_produtos", {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      });
    }

    if (!tabela.desconto_valor) {
      await queryInterface.addColumn("pedidos", "desconto_valor", {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      });
    }

    if (!tabela.cupom_id) {
      await queryInterface.addColumn("pedidos", "cupom_id", {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const tabela = await queryInterface.describeTable("pedidos");

    if (tabela.cupom_id) {
      await queryInterface.removeColumn("pedidos", "cupom_id");
    }

    if (tabela.desconto_valor) {
      await queryInterface.removeColumn("pedidos", "desconto_valor");
    }

    if (tabela.total_produtos) {
      await queryInterface.removeColumn("pedidos", "total_produtos");
    }

    if (tabela.endereco_id) {
      await queryInterface.removeColumn("pedidos", "endereco_id");
    }

    if (tabela.frete_valor) {
      await queryInterface.removeColumn("pedidos", "frete_valor");
    }

    if (tabela.frete_tipo) {
      await queryInterface.removeColumn("pedidos", "frete_tipo");
    }
  },
};
