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
        let auditlog = await bot.getGuildAuditLogs(channel.guild.id, 1);
        let entry = auditlog.entries[0];
        console.log(entry);
        let hb = "";
        if (a.event.msg.includes("$hastebin")) {
          let hastebinMessage = 'Gateway Event Info :\n';
          hastebinMessage += 'New Channel ' + channel.name + ' data as JSON\n\n';
          hastebinMessage += JSON.stringify(channel) + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Audit Log Time !\n\n';
          hastebinMessage += 'User :\n';
          hastebinMessage += JSON.stringify(entry.user) + '\n\n';
          hastebinMessage += entry.user.username + '#' + entry.user.discriminator + ' with id ' + entry.user.id;
          hb = await hastebin(configM.config.hastebinServer, hastebinMessage);
        }
        let type = "";
        if  (channel.type === 0) {
          type = "text";
        }
        else {
          type = "voice";
        }
        let mention = channel.mention;
        if (channel.type === 2) mention.shift();
        let finalMessage = a.event.msg.replace('$type', type).replace('$mention', mention).replace('$id', channel.id).replace('$timestamp', channel.createdAt).replace('$hastebin', hb).replace('$name', channel.name).replace('$user', entry.user.username + '#' + entry.user.discriminator).replace('$userId', entry.user.id);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch(e) {
      console.log(e);
    }
  });
  bot.on('channelDelete', async channel => {
    if (channel.type !== 0 && channel.type !== 2) return;
    // Add support for categories
    // Also, add independent support for each type of channels
    // Also, parse json with circular object support
    try {
      let a = await dbEI.getEvent(channel.guild.id, 'channelDelete');
      if (a.event.d === true) {
        let auditlog = await bot.getGuildAuditLogs(channel.guild.id, 1);
        let entry = auditlog.entries[0];
        console.log(entry);
        let hb = "";
        if (a.event.msg.includes("$hastebin")) {
          let hastebinMessage = 'Gateway Event Info :\n';
          hastebinMessage += 'Channel Removed' + channel.name + ' data as JSON\n\n';
          hastebinMessage += JSON.stringify(channel) + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Audit Log Time !\n\n';
          hastebinMessage += 'User :\n';
          hastebinMessage += JSON.stringify(entry.user) + '\n\n';
          hastebinMessage += entry.user.username + '#' + entry.user.discriminator + ' with id ' + entry.user.id;
          hb = await hastebin(configM.config.hastebinServer, hastebinMessage);
        }
        let type = "";
        if  (channel.type === 0) {
          type = "text";
        }
        else {
          type = "voice";
        }
        let mention = channel.mention;
        if (channel.type === 2) mention.shift();
        let finalMessage = a.event.msg.replace('$type', type).replace('$mention', mention).replace('$id', channel.id).replace('$timestamp', channel.createdAt).replace('$hastebin', hb).replace('$name', channel.name).replace('$user', entry.user.username + '#' + entry.user.discriminator).replace('$userId', entry.user.id);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch(e) {
      console.log(e);
    }
  });
  /* bot.on('channelPinUpdate', async (channel) => {
    if (channel.type !== 0 && channel.type !== 2) return;
    // Add support for categories
    // Also, add independent support for each type of channels
    // Also, parse json with circular object support
    try {
      let a = await dbEI.getEvent(channel.guild.id, 'channelDelete');
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
  }); */
  bot.on('channelUpdate', async (channel, oldChannel) => {
    if (channel.type !== 0 && channel.type !== 2) return;
    // Add support for categories
    // Also, add independent support for each type of channels
    // Also, parse json with circular object support
    try {
      let a = await dbEI.getEvent(channel.guild.id, 'channelUpdate');
      if (a.event.d === true) {
        let auditlog = await bot.getGuildAuditLogs(channel.guild.id, 1);
        let entry = auditlog.entries[0];
        console.log(entry);
        let hb = "";
        if (a.event.msg.includes("$hastebin")) {
          let hastebinMessage = 'Gateway Event Info :\n';
          hastebinMessage += 'New Channel ' + channel.name + ' data as JSON\n\n';
          hastebinMessage += JSON.stringify(channel) + '\n\n';
          hastebinMessage += 'Old Channel ' + oldChannel.name + ' data as JSON\n\n';
          hastebinMessage += JSON.stringify(oldChannel) + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Audit Log Time !\n\n';
          hastebinMessage += 'What changed :\n';
          hastebinMessage += 'Before :\n';
          hastebinMessage += JSON.stringify(entry.before) + '\n';
          hastebinMessage += 'After :\n';
          hastebinMessage += JSON.stringify(entry.after) + '\n';
          hastebinMessage += 'User :\n';
          hastebinMessage += JSON.stringify(entry.user) + '\n\n';
          hastebinMessage += entry.user.username + '#' + entry.user.discriminator + ' with id ' + entry.user.id;
          hb = await hastebin(configM.config.hastebinServer, hastebinMessage);
        }
        let type = "";
        if  (channel.type === 0) {
          type = "text";
        }
        else {
          type = "voice";
        }
        let mention = channel.mention;
        if (channel.type === 2) mention.shift();
        let mentionOld = oldChannel.mention;
        if (channel.type === 2) mentionOld.shift();
        let finalMessage = a.event.msg.replace('$type', type).replace('$mention', mention).replace('$id', channel.id).replace('$timestamp', channel.createdAt).replace('$hastebin', hb).replace('$name', channel.name).replace('$oldMention', mentionOld).replace('$oldTimestamp', oldChannel.createdAt).replace('$oldName', oldChannel.name).replace('$user', entry.user.username + '#' + entry.user.discriminator).replace('$userId', entry.user.id);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch(e) {
      console.log(e);
    }
  });
};