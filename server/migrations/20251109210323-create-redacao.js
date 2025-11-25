'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Redacaos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      imagemUrl: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      notaC1: {
        type: Sequelize.INTEGER
      },
      notaC2: {
        type: Sequelize.INTEGER
      },
      notaC3: {
        type: Sequelize.INTEGER
      },
      notaC4: {
        type: Sequelize.INTEGER
      },
      notaC5: {
        type: Sequelize.INTEGER
      },
      notaTotal: {
        type: Sequelize.INTEGER
      },
      itensAnulatorios: {
        type: Sequelize.JSON
      },
      descricoes: {
        type: Sequelize.JSON
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', 
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Redacaos');
  }
};