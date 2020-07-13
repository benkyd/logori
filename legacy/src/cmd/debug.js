const commandH = require('../commandHandler');
const bot = require('../botClient').bot;
const uptimeM = require('../uptimeManager');

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
    debugMessage += 'Logori v2.3.1\n\n';
    debugMessage += 'Shard id ' + message.channel.guild.shard.id + ' on ' + bot.shards.size + '\n';
    debugMessage += 'Uptime : ' + bot.uptime / 1000 + ' seconds\n';
    debugMessage += 'Memory Usage : ' + Math.floor(process.memoryUsage().rss / 1048576) + ' MiB\n';
    // if (uptimeM.uptimeInfo.runningTime) {
    //   let t = new Date();
    //   let totalTime = t.getTime() - uptimeM.uptimeInfo.firstLaunch;
    //   let sessionDuration = t.getTime() - uptimeM.startTime.getTime();
    //   let pourcentage = (uptimeM.uptimeInfo.runningTime + sessionDuration) / totalTime * 100;
    //   let roundPourcentage = Math.round(pourcentage * 100) / 100;
    //   debugMessage += 'Uptime Percentage : ' + roundPourcentage + '%\n';
    // }
    // else {
    //   debugMessage += 'Uptime Percentage : 100%\n';
    // }
    debugMessage += '```';
    bot.createMessage(message.channel.id, debugMessage);
  });
  commandH.endpoint('^uptime$', async (match, message) => {
    bot.createMessage(message.channel.id, 'The bot has been running for ' + bot.uptime / 1000 + ' seconds');
  });
};