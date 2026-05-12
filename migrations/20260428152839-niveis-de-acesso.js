"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn("users", "acesso", {
      type: Sequelize.ENUM("admin", "user"),
      defaultValue: "user",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("users", "acesso");
  },
};
