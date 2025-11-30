'use strict';

export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('Redacaos', 'tema', {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: 'Tema não informado'
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('Redacaos', 'tema');
}