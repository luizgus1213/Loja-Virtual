"use strict";

/** @type {import("sequelize-cli").Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("avaliacoes", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      produto_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      nota: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      comentario: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addConstraint("avaliacoes", {
      fields: ["user_id", "produto_id"],
      type: "unique",
      name: "avaliacoes_user_produto_unique",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("avaliacoes");
  },
};
