const Eris = require('eris');
const configM = require('./src/configManager');
const logger = require('./src/logger');
const commandL = require('./src/commandLoader');

// TODO: botClient.js

if (!configM.loadConfig('./config.json')) {
  logger.error('No config file has been found in the directory, please configure the template that has been created.');
}
logger.log('Config loaded');

commandL.load();
logger.log('Commands loaded');

var bot = new Eris(configM.config.token);
bot.on('ready', () => {
    logger.log(bot.user.username + '#' + bot.user.discriminator);
    bot.editStatus('online', {
      name: configM.config.game,
    });
    logger.log('Game has been set to ' + configM.config.game);
    logger.log('Done !');
});

bot.on("messageCreate", (msg) => {
    if(msg.content === "!ping") {
        bot.createMessage(msg.channel.id, "Pong!");
    }
});

bot.connect();

process.on('SIGINT', function() {
  bot.disconnect();
  logger.log('Disconnected');
  process.exit();
});