import { Sequelize } from 'sequelize';
import process from 'process';
import 'dotenv/config';

import userModel from './user.js';
import turmaModel from './turma.js';
import redacaoModel from './redacao.js';
import userTurmasModel from './UserTurmas.js';
import propostaModel from './Proposta.js'; 

const db = {}; 
let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false 
      }
    }
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST || '127.0.0.1',
      dialect: 'postgres',
      logging: false
    }
  );
}

const User = userModel(sequelize, Sequelize.DataTypes);
const Turma = turmaModel(sequelize, Sequelize.DataTypes);
const Redacao = redacaoModel(sequelize, Sequelize.DataTypes);
const UserTurmas = userTurmasModel(sequelize, Sequelize.DataTypes);
const Proposta = propostaModel(sequelize); 

db.User = User;
db.Turma = Turma;
db.Redacao = Redacao;
db.UserTurmas = UserTurmas;
db.Proposta = Proposta; 

User.belongsToMany(Turma, { through: UserTurmas, as: 'Turmas', foreignKey: 'userId' });
Turma.belongsToMany(User, { through: UserTurmas, as: 'Users', foreignKey: 'turmaId' });
User.hasMany(UserTurmas, { foreignKey: 'userId' });
UserTurmas.belongsTo(User, { foreignKey: 'userId' });
Turma.hasMany(UserTurmas, { foreignKey: 'turmaId' });
UserTurmas.belongsTo(Turma, { foreignKey: 'turmaId' });
User.hasMany(Turma, { foreignKey: 'professorId', as: 'TurmasCriadas' });
Turma.belongsTo(User, { foreignKey: 'professorId', as: 'Professor' });
User.hasMany(Redacao, { foreignKey: 'userId' });
Redacao.belongsTo(User, { foreignKey: 'userId' });
Turma.hasMany(Proposta, { foreignKey: 'turmaId', as: 'Propostas' });
Proposta.belongsTo(Turma, { foreignKey: 'turmaId', as: 'Turma' });
Proposta.hasMany(Redacao, { foreignKey: 'propostaId', as: 'Redacoes' });
Redacao.belongsTo(Proposta, { foreignKey: 'propostaId', as: 'Proposta' });
Turma.hasMany(Redacao, { foreignKey: 'turmaId', as: 'Redacoes' });
Redacao.belongsTo(Turma, { foreignKey: 'turmaId', as: 'Turma' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;