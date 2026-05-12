"use strict";
const bcrypt = require("bcrypt");
/** @type {import('sequelize-cli').Migration} */

const chave_criptografia = "melao";

module.exports = {
  async up(queryInterface, Sequelize) {
    const senha = await bcrypt.hash("123456" + chave_criptografia, 10);
    await queryInterface.bulkInsert(
      "users",
      [
        {
          nome: "admin",
          email: "admin@admin.com",
          cpf: "123.123.123-10",
          numero_telefone: "5511953527110",
          acesso: "admin",
          senha,
          foto_perfil_id: null,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", null, {});
  },
};
