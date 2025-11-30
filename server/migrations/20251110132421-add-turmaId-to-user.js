'use strict';

export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('Users', 'turmaId', {
    type: Sequelize.INTEGER,
    allowNull: true, 
    references: {
      model: 'Turmas', 
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('Users', 'turmaId');
}