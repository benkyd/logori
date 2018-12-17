const configM = require('./src/configManager');
const logger = require('./src/logger');
const commandH = require('./src/commandHandler');
const uptimeM = require('./src/uptimeManager');

uptimeM.loadUptime();

if (!configM.loadConfig('./config.json')) {
  logger.error('No config file has been found in the directory, please configure the template that has been created.');
}
logger.log('Config loaded');

const bot = require('./src/botClient').bot;

require('./src/commandLoader').load();
logger.log('Modules loaded');

require('./src/dbEventInterface');
logger.log('Database Loaded');

bot.on('ready', () => {
  logger.log(bot.user.username + '#' + bot.user.discriminator);
  bot.editStatus('online', {
    name: configM.config.game,
  });
  logger.log('Game has been set to ' + configM.config.game);
  logger.log('Done !');
});

bot.on('messageCreate', (msg) => {
  let content = msg.content.replace(new RegExp(`^(?:<@${bot.user.id}> +|\\*)\\b`), '');
  if (content === msg.content) return;
  if (msg.author.bot) return;
  if (msg.author === bot.user) return;
  if (msg.channel.type !== 0) return;
  let trimmedContent = content.trim();
  commandH.apply(trimmedContent, msg);
});

bot.connect();

process.on('SIGINT', async function() {
  uptimeM.thingsDoTo();
  await bot.disconnect();
  logger.log('Disconnected');
  process.exit();
});