const commandH = require('../commandHandler');
const bot = require('../botClient').bot;
const dbEI = require('../dbEventInterface');
const hastebin = require('../hastebin');
const configM = require('../configManager');

function legitChannel(message, channelId) {
  let c = message.channel.guild.channels.find((ch) => {
    if (ch.id === channelId) {
      return true;
    }
  });
  if (c) {
    return true;
  }
  else {
    return false;
  }
}

function findMember(guild, userId) {
  let m = guild.members.find((memb) => {
    if (memb.user.id === userId) {
      return true;
    }
  });
  return m;
}

exports.loadModule = function loadModule() {
  commandH.endpoint('^(?:init|set)serv$', async (match, message) => {
    if (!message.member.permission.has('manageGuild') && message.author.id !== configM.config.owner) return;
    try {
      await dbEI.initServer(message.channel.guild.id, message.channel.id);
      bot.createMessage(message.channel.id, 'Server **successfully** initialized ! The fallback event channel has been set to this channel, you can modify it with the command `set-fallback-channel` in the target channel. See <https://github.com/ahoZiorce/logori/blob/master/BOTLIST.md> to get some help with the commands');
    }
    catch (e) {
      console.log(e);
      bot.createMessage(message.channel.id, 'An error occured');
    }
  });
  commandH.endpoint('^softban <@(.+)>$', async (match, message) => {
    if (!message.member.permission.has('kickMembers') && message.author.id !== configM.config.owner) return;
    let m = findMember(message.channel.guild, bot.user.id);

    if (!message.member.permission.has('banMembers')) return;
    try {
      await bot.banGuildMember(message.channel.guild.id, match[1]);
      bot.unbanGuildMember(message.channel.guild.id, match[1]);
    }
    catch (e) {
      console.log(e);
      bot.createMessage(message.channel.id, 'An error occured');
    }
  });
  commandH.endpoint('^state(?: (.*))?$', async (match, message) => {
    if (!message.member.permission.has('manageGuild') && message.author.id !== configM.config.owner) return;
    if (match[1]) {
      let text = JSON.stringify(await dbEI.getEvent(message.channel.guild.id, match[1]), null, 4);
      bot.createMessage(message.channel.id, await hastebin(configM.config.hastebinServer, text));
    }
    else {
      let text = JSON.stringify(await dbEI.getAllServer(message.channel.guild.id), null, 4);
      bot.createMessage(message.channel.id, await hastebin(configM.config.hastebinServer, text));
    }
  });
  commandH.endpoint('^set-fallback-channel(?: <#(.+?)>)?$', async (match, message) => {
    if (!message.member.permission.has('manageGuild') && message.author.id !== configM.config.owner) return;
    let channelId = message.channel.id;
    if (match[1]) {
      channelId = match[1];
    }
    // TODO: Check if the set channel is in this guild
    if (legitChannel(message, channelId)) {
      dbEI.setFallbackChannel(message.channel.guild.id, channelId);
      bot.createMessage(message.channel.id, `Fallback **set** to the channel <#${channelId}>, all the event logging is be done there by default. A message is be sent in that channel to make sure it is correct.`);
      bot.createMessage(channelId, `<@${message.author.id}>, this is now the fallback channel for all the events. That means if some event doesn't have some channel set, it will default to this channel`);
    }
    else {
      bot.createMessage(message.channel.id, 'That channel is not in this guild. Don\'t try to prank me.');
    }
  });
  commandH.endpoint('^event (.+) msg ([\\s\\S]+)$', async (match, message) => {
    if (!message.member.permission.has('manageGuild') && message.author.id !== configM.config.owner) return;
    dbEI.setEventMsg(message.channel.guild.id, match[1], match[2]);
    bot.createMessage(message.channel.id, 'Event message set');
  });
  commandH.endpoint('^event (.+) channel(?: (?:<#(.+?)>|(fallback|f)))?$', async (match, message) => {
    if (!message.member.permission.has('manageGuild') && message.author.id !== configM.config.owner) return;
    let channelId = message.channel.id;
    if (match[2]) {
      channelId = match[2];
    }
    else if (match[3]) {
      channelId = 'f';
    }
    if (legitChannel(message, channelId) || channelId === 'f') {
      dbEI.setEventChannel(message.channel.guild.id, match[1], channelId);
      if (channelId === 'f') {
        bot.createMessage(message.channel.id, `This event\'s channel has been set back to the **fallback channel**, the logging for ${match[1]} will be done there.`);
      }
      else {
        bot.createMessage(message.channel.id, `Event channel **set** to <#${channelId}>. The fallback channel for the event ${match[1]} has been overriden. To bind again the event to the fallback channel, execute \`event ${match[1]} channel fallback\``);
      }
    }
    else {
      bot.createMessage(message.channel.id, 'That channel is not in this guild. Don\'t try to prank me.');
    }
  });
  commandH.endpoint('^event (.+) state (.+)$', async (match, message) => {
    if (!message.member.permission.has('manageGuild') && message.author.id !== configM.config.owner) return;
    let newState = true;
    if (match[2]) {
      if (match[2] === 'enable' || match[2] === 'true') {
        newState = true;
      }
      else if (match[2] === 'disable' || match[2] === 'false') {
        newState = false;
      }
      else {
        bot.createMessage(message.channel.id, `Invalid option, try: \`event ${match[1]} (enable|true|disable|false)\``);
        return;
      }
    }
    dbEI.setEventEnable(message.channel.guild.id, match[1], newState);
    if (newState) {
      bot.createMessage(message.channel.id, `Event ${match[1]} has been **enabled**`);
    }
    else {
      bot.createMessage(message.channel.id, `Event ${match[1]} has been **disabled**`);
    }
  });
};