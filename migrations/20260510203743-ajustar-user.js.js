"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // deixa cpf opcional
    await queryInterface.changeColumn("users", "cpf", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });

    // adiciona cpf_verificado
    await queryInterface.addColumn("users", "cpf_verificado", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("users", "cpf", {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });

    await queryInterface.removeColumn("users", "cpf_verificado");
  },
};
