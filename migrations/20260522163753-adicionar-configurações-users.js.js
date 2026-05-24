"use strict";

/** @type {import("sequelize-cli").Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "tema_preferido", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "dark",
    });

    await queryInterface.addColumn("users", "notificar_pedidos", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });

    await queryInterface.addColumn("users", "notificar_promocoes", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn("users", "notificar_seguranca", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });

    await queryInterface.addColumn("users", "token_version", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    });

    await queryInterface.addColumn("users", "conta_desativada", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn("users", "desativado_em", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("users", "desativado_em");
    await queryInterface.removeColumn("users", "conta_desativada");
    await queryInterface.removeColumn("users", "token_version");
    await queryInterface.removeColumn("users", "notificar_seguranca");
    await queryInterface.removeColumn("users", "notificar_promocoes");
    await queryInterface.removeColumn("users", "notificar_pedidos");
    await queryInterface.removeColumn("users", "tema_preferido");
  },
};
