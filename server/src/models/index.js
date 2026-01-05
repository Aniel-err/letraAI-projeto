import Sequelize from 'sequelize';
import process from 'process';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from "module";
import 'dotenv/config';

import userModel from './user.js';
import turmaModel from './turma.js';
import redacaoModel from './redacao.js';
import userTurmasModel from './UserTurmas.js';

const require = createRequire(import.meta.url);
const config = require('../../config/config.json');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];
const db = {};

const database = process.env.DB_NAME || dbConfig.database;
const username = process.env.DB_USERNAME || dbConfig.username;
const password = process.env.DB_PASSWORD || dbConfig.password;
const host = process.env.DB_HOST || dbConfig.host;
const dialect = process.env.DB_DIALECT || dbConfig.dialect;

const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: dialect,
  logging: false 
});

const User = userModel(sequelize, Sequelize.DataTypes);
const Turma = turmaModel(sequelize, Sequelize.DataTypes);
const Redacao = redacaoModel(sequelize, Sequelize.DataTypes);
const UserTurmas = userTurmasModel(sequelize, Sequelize.DataTypes);

db.User = User;
db.Turma = Turma;
db.Redacao = Redacao;
db.UserTurmas = UserTurmas;


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

Turma.hasMany(Redacao, { foreignKey: 'turmaId', as: 'Redacoes' });
Redacao.belongsTo(Turma, { foreignKey: 'turmaId', as: 'Turma' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;