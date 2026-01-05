'use strict';

export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('Turmas', 'tema', {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: 'Tema Livre'
  });

  await queryInterface.addColumn('Redacaos', 'editedAt', {
    type: Sequelize.DATE,
    allowNull: true
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('Turmas', 'tema');
  await queryInterface.removeColumn('Redacaos', 'editedAt');
}