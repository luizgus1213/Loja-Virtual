"use strict";

/** @type {import("sequelize-cli").Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tabela = await queryInterface.describeTable("avaliacoes");

    if (!tabela.pedido_id) {
      await queryInterface.addColumn("avaliacoes", "pedido_id", {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }

    if (!tabela.comentario) {
      await queryInterface.addColumn("avaliacoes", "comentario", {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const tabela = await queryInterface.describeTable("avaliacoes");

    if (tabela.comentario) {
      await queryInterface.removeColumn("avaliacoes", "comentario");
    }

    if (tabela.pedido_id) {
      await queryInterface.removeColumn("avaliacoes", "pedido_id");
    }
  },
};
