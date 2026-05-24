"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("produto_imagens", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      produto_id: {
        type: Sequelize.INTEGER,
        allowNull: false,

        references: {
          model: "produtos",
          key: "id",
        },

        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },

      arquivo_id: {
        type: Sequelize.INTEGER,
        allowNull: false,

        references: {
          model: "arquivos",
          key: "id",
        },

        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },

      principal: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      ordem: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("produto_imagens");
  },
};
