const commandH = require('../commandHandler');
const bot = require('../botClient').bot;
const dbEI = require('../dbEventInterface');
const hastebin = require('../hastebin');
const configM = require('../configManager');

exports.loadModule = function loadModule () {
  bot.on('channelCreate', async channel => {
    if (channel.type !== 0 && channel.type !== 2) return;
    // Add support for categories
    // Also, add independent support for each type of channels
    // Also, parse json with circular object support
    try {
      let a = await dbEI.getEvent(channel.guild.id, 'channelCreate');
      if (a.event.d === true) {
        let type = "";
        if  (channel.type === 0) {
          type = "text";
        }
        else {
          type = "voice";
        }
        let mention = channel.mention;
        if (channel.type === 2) mention.shift();
        let hb = "";
        if (a.event.msg.includes("$hastebin")) {
          hb = await hastebin(configM.config.hastebinServer, 'Channel ' + channel.name + ' data as JSON\n\n------------------\n\n' + JSON.stringify(channel));
        }
        let finalMessage = a.event.msg.replace('$type', type).replace('$mention', mention).replace('$id', channel.id).replace('$timestamp', channel.createdAt).replace('$hastebin', hb).replace('$name', channel.name);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch(e) {
      console.log(e);
    }
  });
};