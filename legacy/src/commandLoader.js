const fs = require('fs');
const commandH = require('./commandHandler');
const logger = require('./logger');

module.exports.load = function load() {
  fs.readdirSync('./src/cmd/').forEach(file => {
    if (file.endsWith('.js')) {
      let plugin = require(`./cmd/${file}`);
      if (plugin.loadModule) {
        plugin.loadModule();
        logger.log(`${file} loaded`);
      }
    }
  });
};
