import Sequelize from 'sequelize';
import process from 'process';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from "module";

import userModel from './user.js';
import turmaModel from './turma.js';
import redacaoModel from './redacao.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = createRequire(import.meta.url);
const config = require('../../config/config.json');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];
const db = {};

let sequelize;
if (dbConfig.use_env_variable) {
  sequelize = new Sequelize(process.env[dbConfig.use_env_variable], dbConfig);
} else {
  sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);
}

const User = userModel(sequelize, Sequelize.DataTypes);
const Turma = turmaModel(sequelize, Sequelize.DataTypes);
const Redacao = redacaoModel(sequelize, Sequelize.DataTypes);

db.User = User;
db.Turma = Turma;
db.Redacao = Redacao;


Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;