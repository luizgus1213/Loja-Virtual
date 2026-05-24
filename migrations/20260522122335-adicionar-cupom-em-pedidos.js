"use strict";

/** @type {import("sequelize-cli").Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("pedidos", "cupom_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn("pedidos", "desconto_valor", {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("pedidos", "desconto_valor");
    await queryInterface.removeColumn("pedidos", "cupom_id");
  },
};
