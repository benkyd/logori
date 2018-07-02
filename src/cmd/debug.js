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
};