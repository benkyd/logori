const fs = require('fs');
const logger = require('./logger');

module.exports.config = undefined;

module.exports.loadConfig = function loadConfig(configPath) {
  if (fs.existsSync(configPath)) {
    module.exports.config = JSON.parse(fs.readFileSync(configPath));
    return true;
  }
  else {
    let builder = {
      token: 'YOUR BOT TOKEN HERE',
      game: 'BOT GAME HERE',
      owner: 'BOT OWNER ID HERE',
      hastebinServer: 'https://hastebin.com',
    };
    fs.appendFileSync(configPath, JSON.stringify(builder));
    return false;
  }
};
