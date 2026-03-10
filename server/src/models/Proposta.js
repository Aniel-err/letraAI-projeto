import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Proposta = sequelize.define('Proposta', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    textoMotivador: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    prazo: {
      type: DataTypes.DATE, 
      allowNull: true,
    },
    turmaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    tableName: 'Proposta', 
    freezeTableName: true  
  });

  return Proposta;
};