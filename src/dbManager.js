const sequelize = require('sequelize');

const database = new sequelize('database', 'user', 'password', {
  operatorsAliases: false,
  dialect: 'sqlite',
  logging: false,
  storage: 'logoriDB.sqlite',
});

const server = database.define('server', {
  discordId: {
    type: sequelize.STRING,
    unique: true,
  },
  logChannelId: sequelize.STRING,
}, {
  timestamps: false,
});

module.exports.sync = function sync(opt) {
  return database.sync(opt);
};

module.exports.server = server;
