const commandH = require('../commandHandler');
const bot = require('../botClient').bot;
const dbEI = require('../dbEventInterface');

exports.loadModule = function loadModule () {
  commandH.endpoint('^(?:init|set)serv$', async (match, message) => {
    if (!message.member.permission.has('administrator')) return;
    try {
      await dbEI.initServer(message.channel.guild.id, message.channel.id);
      bot.createMessage(message.channel.id, 'Server successfully set');
    }
    catch(e) {
      console.log(e);
      bot.createMessage(message.channel.id, 'An error happened');
    }
  });
  commandH.endpoint('^debugserv$', async (match, message) => {
    dbEI.debugServer(message.channel.guild.id);
  });
  commandH.endpoint('^set-fallback(?: <#(.+?)>)?$', async (match, message) => {
    let channelId = message.channel.id;
    if (match[1]) {
      channelId = match[1];
    }
    // TODO: Check if the set channel is in this guild
    dbEI.setFallbackChannel(message.channel.guild.id, channelId);
    bot.createMessage(message.channel.id, 'Fallback set to that channel, all the event logging will be done there by default. A message will be sent in that channel to make sure it is correct.');
    bot.createMessage(channelId, `<@${message.author.id}>, this is now the fallback channel for all the events.`);
  });
  commandH.endpoint('^event(?:-set)? (.+) msg (.+)$', async (match, message) => {
    dbEI.setEventMsg(message.channel.guild.id, match[1], match[2]);
    bot.createMessage(message.channel.id, 'Event message set');
  });
  commandH.endpoint('^event(?:-set)? (.+) channel(?: (?:<#(.+?)>|(fallback|f)))?$', async (match, message) => {
    let channelId = message.channel.id;
    if (match[2]) {
      channelId = match[2];
    }
    else if (match[3]) {
      channelId = 'f';
    }
    dbEI.setEventChannel(message.channel.guild.id, match[1], channelId);
    if (channelId === 'f') {
      bot.createMessage(message.channel.id, 'This event\'s channel has been set to the **fallback channel**');
    }
    else {
      bot.createMessage(message.channel.id, `Event channel set to <#${channelId}>. The fallback channel for that even has been overriden. To bind again the event to the fallback channel, execute \`event ${match[1]} channel fallback\``);
    }
  });
    // Change the endpoint below, put something that couldn't interfere with the other
  commandH.endpoint('^event(-set)? (.+) (.+)$', async (match, message) => {
    let newState = true;
    if (match[3]) {
      if (match[3] === 'enable' || match[3] === 'true') {
        newState = true;
      }
      else if (match[3] === 'disable' || match[3] === 'false') {
        newState = false;
      }
      else {
        bot.createMessage(message.channel.id, `Invalid option, the possibilities are : \`event${match[1] ? match[1] : ''} ${match[2]} (enable|true|disable|false)\``);
        return;
      }
    }
    dbEI.setEventEnable(message.channel.guild.id, match[2], newState);
    if (newState) {
      bot.createMessage(message.channel.id, `Event ${match[2]} has been **enabled**`);
    }
    else {
      bot.createMessage(message.channel.id, `Event ${match[2]} has been **disabled**`);
    }
  });
};