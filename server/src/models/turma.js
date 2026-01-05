export default (sequelize, DataTypes) => {
  const Turma = sequelize.define('Turma', {
    nome: { type: DataTypes.STRING },
    tema: { type: DataTypes.STRING },
    professorId: { type: DataTypes.INTEGER }
  });

  return Turma;
};