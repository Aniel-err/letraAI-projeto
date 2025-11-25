'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Redacaos', 'tema', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'Tema não informado'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Redacaos', 'tema');
  }
};