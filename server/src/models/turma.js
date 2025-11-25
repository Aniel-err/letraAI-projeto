'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Turma extends Model {
  static associate(models) {
    Turma.belongsTo(models.User, { 
      foreignKey: 'professorId',
      as: 'Professor'
    });

    Turma.hasMany(models.User, {
      foreignKey: 'turmaId' 
    });
  }
  }
  Turma.init({
    nome: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Turma',
  });
  return Turma;
};