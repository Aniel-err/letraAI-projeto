'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
     static associate(models) {
    User.hasMany(models.Turma, { 
      foreignKey: 'professorId',
      as: 'TurmasProfessor' 
    });

    User.belongsTo(models.Turma, {
      foreignKey: 'turmaId'
    });

    User.hasMany(models.Redacao, { 
      foreignKey: 'userId' 
    });
  }
  }

  User.init({
    nome: DataTypes.STRING,
    turmaId: DataTypes.INTEGER, 

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'aluno'
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};