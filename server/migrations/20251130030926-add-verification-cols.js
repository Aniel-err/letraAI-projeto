'use strict';

export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('Users', 'isVerified', {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  });
  await queryInterface.addColumn('Users', 'verificationToken', {
    type: Sequelize.STRING,
    allowNull: true
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('Users', 'isVerified');
  await queryInterface.removeColumn('Users', 'verificationToken');
}