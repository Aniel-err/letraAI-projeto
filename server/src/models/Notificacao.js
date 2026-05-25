export default (sequelize, DataTypes) => {
  const Notificacao = sequelize.define('Notificacao', {
    mensagem: { type: DataTypes.TEXT, allowNull: false },
    lida: { type: DataTypes.BOOLEAN, defaultValue: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    redacaoId: { type: DataTypes.INTEGER, allowNull: false }
  });

  return Notificacao;
};
