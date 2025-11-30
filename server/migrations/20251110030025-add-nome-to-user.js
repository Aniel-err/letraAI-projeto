'use strict';

export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('Users', 'nome', {
    type: Sequelize.STRING,
    allowNull: true
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('Users', 'nome');
}