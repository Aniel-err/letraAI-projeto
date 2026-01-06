import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Turma extends Model {
    static associate(models) {
      Turma.belongsTo(models.User, { foreignKey: 'professorId', as: 'Professor' });
      Turma.belongsToMany(models.User, { through: 'UserTurmas', as: 'Users', foreignKey: 'turmaId' });
      Turma.hasMany(models.Redacao, { foreignKey: 'turmaId', as: 'Redacoes' });
    }
  }
  Turma.init({
    nome: DataTypes.STRING,
    tema: DataTypes.STRING,
    prazo: DataTypes.DATE 
  }, {
    sequelize,
    modelName: 'Turma',
  });
  return Turma;
};