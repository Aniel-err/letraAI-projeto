import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Redacao extends Model {
    static associate(models) {
      Redacao.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }
  Redacao.init({
    tema: DataTypes.STRING,
    imagemUrl: DataTypes.STRING,
    status: DataTypes.STRING,
    notaC1: DataTypes.INTEGER,
    notaC2: DataTypes.INTEGER,
    notaC3: DataTypes.INTEGER,
    notaC4: DataTypes.INTEGER,
    notaC5: DataTypes.INTEGER,
    notaTotal: DataTypes.INTEGER,
    itensAnulatorios: DataTypes.JSON,
    descricoes: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'Redacao',
  });
  return Redacao;
};