'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'turmaId');
  }
};