"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("pedidos", "status", {
      type: Sequelize.ENUM(
        "aguardando_pagamento",
        "pago",
        "cancelado",
        "expirado",
      ),
      allowNull: false,
      defaultValue: "aguardando_pagamento",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("pedidos", "status", {
      type: Sequelize.ENUM("pendente", "pago", "cancelado"),
      allowNull: false,
      defaultValue: "pendente",
    });
  },
};
