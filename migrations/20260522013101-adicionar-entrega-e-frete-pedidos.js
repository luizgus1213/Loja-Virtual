"use strict";

/** @type {import("sequelize-cli").Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("pedidos", "endereco_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn("pedidos", "frete_tipo", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("pedidos", "frete_valor", {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn("pedidos", "total_produtos", {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.sequelize.query(`
      UPDATE pedidos
      SET total_produtos = total
      WHERE total_produtos = 0
    `);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("pedidos", "endereco_id");
    await queryInterface.removeColumn("pedidos", "frete_tipo");
    await queryInterface.removeColumn("pedidos", "frete_valor");
    await queryInterface.removeColumn("pedidos", "total_produtos");
  },
};
