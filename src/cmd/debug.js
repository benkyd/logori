const commandH = require('../commandHandler');
const bot = require('../botClient').bot;

exports.loadModule = function loadModule () {
  commandH.endpoint('^ping test$', (match, message) => {
    bot.createMessage(message.channel.id, 'hey ho');
  });
  commandH.endpoint('^ping test (.*)$', (match, message) => {
    bot.createMessage(message.channel.id, 'hey ho ' + match[1]);
  });
}