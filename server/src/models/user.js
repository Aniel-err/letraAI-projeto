export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    nome: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, unique: true },
    password: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING, defaultValue: 'aluno' },
    avatar: { type: DataTypes.STRING },
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    verificationToken: { type: DataTypes.STRING },
    resetPasswordToken: { type: DataTypes.STRING },
    resetPasswordExpires: { type: DataTypes.DATE },
    turmaId: { type: DataTypes.INTEGER }, 
    turmaStatus: { type: DataTypes.STRING }
  });

  return User;
};