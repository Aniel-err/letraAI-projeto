export default (sequelize, DataTypes) => {
  const UserTurmas = sequelize.define('UserTurmas', {
    userId: {
      type: DataTypes.INTEGER,
      references: { model: 'Users', key: 'id' }
    },
    turmaId: {
      type: DataTypes.INTEGER,
      references: { model: 'Turmas', key: 'id' }
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pendente'
    }
  }, {
    tableName: 'UserTurmas',
    timestamps: true
  });

  return UserTurmas;
};