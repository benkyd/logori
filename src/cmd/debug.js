const commandH = require('../commandHandler');
const bot = require('../botClient').bot;

exports.loadModule = function loadModule () {
  commandH.endpoint('^ping$', (match, message) => {
    bot.createMessage(message.channel.id, 'Pong');
  });
  commandH.endpoint('^ping (.*)$', (match, message) => {
    bot.createMessage(message.channel.id, 'Pong : ' + match[1]);
  });
}