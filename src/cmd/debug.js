const commandH = require('../commandHandler');
const bot = require('../botClient').bot;

exports.loadModule = function loadModule () {
  commandH.endpoint('^ping$', (match, message) => {
    bot.createMessage(message.channel.id, 'Pong');
  });
  commandH.endpoint('^ping (.*)$', (match, message) => {
    bot.createMessage(message.channel.id, 'Pong : ' + match[1]);
    let time = new Date();
    bot.once('messageCreate', (msg) => {
      let ms = new Date().getTime() - time.getTime();
      if (msg.channel !== message.channel) return;
      if (msg.author !== bot.user) return;
      bot.createMessage(msg.channel.id, ms + ' ms');
    });
  });
  commandH.endpoint('^debug$', async (match, message) => {
    let debugMessage = '```\n';
    debugMessage += 'Logori v2.2.1\n\n';
    debugMessage += 'Shard id ' + message.channel.guild.shard.id + ' on ' + bot.shards.size + '\n';
    debugMessage += 'Uptime : ' + bot.uptime / 1000 + ' seconds\n';
    debugMessage += 'Memory Usage : ' + Math.floor(process.memoryUsage().rss / 1048576) + ' MiB\n';
    debugMessage += '```';
    bot.createMessage(message.channel.id, debugMessage);
  });
  commandH.endpoint('^uptime$', async (match, message) => {
    bot.createMessage(message.channel.id, 'The bot has been running for ' + bot.uptime / 1000 + ' seconds');
  });
};