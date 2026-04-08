'use strict';

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('UserTurmas', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
      onDelete: 'CASCADE'
    },
    turmaId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'Turmas', key: 'id' },
      onDelete: 'CASCADE'
    },
    status: {
      type: Sequelize.STRING,
      defaultValue: 'pendente' 
    },
    createdAt: { allowNull: false, type: Sequelize.DATE },
    updatedAt: { allowNull: false, type: Sequelize.DATE }
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('UserTurmas');
}