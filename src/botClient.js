const Eris = require('eris');
const configM = require('./configManager');
exports.bot = new Eris(configM.config.token);