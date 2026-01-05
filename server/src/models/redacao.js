export default (sequelize, DataTypes) => {
  const Redacao = sequelize.define('Redacao', {
    tema: { type: DataTypes.STRING },
    imagemUrl: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'Enviada' },
    
    notaC1: { type: DataTypes.INTEGER },
    notaC2: { type: DataTypes.INTEGER },
    notaC3: { type: DataTypes.INTEGER },
    notaC4: { type: DataTypes.INTEGER },
    notaC5: { type: DataTypes.INTEGER },
    notaTotal: { type: DataTypes.INTEGER },
    itensAnulatorios: { type: DataTypes.JSON },
    descricoes: { type: DataTypes.JSON },

    editedAt: { type: DataTypes.DATE }, 
    userId: { type: DataTypes.INTEGER },
    turmaId: { type: DataTypes.INTEGER } 
  });

  return Redacao;
};