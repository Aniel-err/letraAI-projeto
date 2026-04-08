import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Turma extends Model {
    static associate(models) {
      Turma.belongsTo(models.User, { foreignKey: 'professorId', as: 'Professor' });
      Turma.belongsToMany(models.User, { through: 'UserTurmas', as: 'Users', foreignKey: 'turmaId' });
      Turma.hasMany(models.Redacao, { foreignKey: 'turmaId', as: 'Redacoes' });
      Turma.hasMany(models.Proposta, { foreignKey: 'turmaId', as: 'Propostas' });
    }
  }
  Turma.init({
    nome: { type: DataTypes.STRING, allowNull: false },
    tema: { type: DataTypes.STRING, allowNull: true },
    prazo: { type: DataTypes.DATE, allowNull: true }
  }, {
    sequelize,
    modelName: 'Turma',
  });
  return Turma;
};