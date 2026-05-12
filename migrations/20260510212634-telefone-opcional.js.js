"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("users", "numero_telefone", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("users", "numero_telefone", {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });
  },
};
