const commandH = require('../commandHandler');
const bot = require('../botClient').bot;
const dbEI = require('../dbEventInterface');
const hastebin = require('../hastebin');
const configM = require('../configManager');

// Redo the first events because they're probably fucked up

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
        let hb = "";
        if (a.event.msg.includes("$hastebin")) {
          let hastebinMessage = 'Gateway Event Info :\n';
          hastebinMessage += 'Channel Removed ' + channel.name + ' data as JSON\n\n';
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
        let finalMessage = a.event.msg.replace('$type', type).replace('$id', channel.id).replace('$timestamp', channel.createdAt).replace('$hastebin', hb).replace('$name', channel.name).replace('$user', entry.user.username + '#' + entry.user.discriminator).replace('$userId', entry.user.id);
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
        console.log(entry.before);
        console.log(entry.after);
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
  // Do another option to have a Pollr type of thing for ban, unban and kick
  bot.on('guildBanAdd', async (guild, user) => {
    try {
      let a = await dbEI.getEvent(guild.id, 'guildBanAdd');
      if (a.event.d === true) {
        let auditlog = await bot.getGuildAuditLogs(guild.id, 1);
        let entry = auditlog.entries[0];
        let hb = "";
        if (a.event.msg.includes("$hastebin")) {
          let hastebinMessage = 'User banned :\n';
          hastebinMessage += JSON.stringify(user) + '\n';
          hastebinMessage += user.username + '#' + user.discriminator + ' with id ' + user.id + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Audit Log Informations !\n\n';
          hastebinMessage += 'Additional informations on the ban :\n';
          hastebinMessage += 'Reason :\n\n';
          hastebinMessage += entry.reason + '\n\n';
          hastebinMessage += 'Responsible :\n';
          hastebinMessage += JSON.stringify(entry.user) + '\n';
          hastebinMessage += entry.user.username + '#' + entry.user.discriminator + ' with id ' + entry.user.id;
          hb = await hastebin(configM.config.hastebinServer, hastebinMessage);
        }
        let finalMessage = a.event.msg.replace('$responsibleId', entry.user.id).replace('$responsible', entry.user.username + '#' + entry.user.discriminator).replace('$userId', user.id).replace('$user', user.username + '#' + user.discriminator).replace('$hastebin', hb).replace('$reason', entry.reason);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch(e) {
      console.log(e);
    }
  });
  bot.on('guildBanRemove', async (guild, user) => {
    try {
      let a = await dbEI.getEvent(guild.id, 'guildBanRemove');
      if (a.event.d === true) {
        let auditlog = await bot.getGuildAuditLogs(guild.id, 1);
        let entry = auditlog.entries[0];
        let hb = "";
        if (a.event.msg.includes("$hastebin")) {
          let hastebinMessage = 'User unbanned :\n';
          hastebinMessage += JSON.stringify(user) + '\n';
          hastebinMessage += user.username + '#' + user.discriminator + ' with id ' + user.id + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Audit Log Informations !\n\n';
          hastebinMessage += 'Additional informations on the unban :\n';
          hastebinMessage += 'Reason :\n\n';
          hastebinMessage += entry.reason + '\n\n';
          hastebinMessage += 'Responsible :\n';
          hastebinMessage += JSON.stringify(entry.user) + '\n';
          hastebinMessage += entry.user.username + '#' + entry.user.discriminator + ' with id ' + entry.user.id;
          hb = await hastebin(configM.config.hastebinServer, hastebinMessage);
        }
        let finalMessage = a.event.msg.replace('$responsibleId', entry.user.id).replace('$responsible', entry.user.username + '#' + entry.user.discriminator).replace('$userId', user.id).replace('$user', user.username + '#' + user.discriminator).replace('$hastebin', hb).replace('$reason', entry.reason);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch(e) {
      console.log(e);
    }
  });
  async function guildEmojiAdd(guild, emojis, oldEmojis) {
    try {
      let a = await dbEI.getEvent(guild.id, 'guildEmojiAdd');
      if (a.event.d === true) {
        let auditlog = await bot.getGuildAuditLogs(guild.id, 1);
        let entry = auditlog.entries[0];
        let hb = "";
        if (a.event.msg.includes("$hastebin")) {
          let hastebinMessage = 'Gateway info :\n';
          hastebinMessage += 'New emojis array\n\n';
          hastebinMessage += JSON.stringify(emojis) + '\n\n';
          hastebinMessage += 'Old emojis array\n\n';
          hastebinMessage += JSON.stringify(oldEmojis) + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Audit Log Moment of the day !\n\n';
          hastebinMessage += 'State of the emoji before :\n';
          hastebinMessage += JSON.stringify(entry.before) + ' (no way, it\'s the emoji create event also, what did you expect)\n\n';
          hastebinMessage += 'State of the emoji after :\n\n';
          hastebinMessage += JSON.stringify(entry.after) + '\n\n';
          hastebinMessage += 'Full emoji object à la audit log :\n\n';
          hastebinMessage += JSON.stringify(entry.target) + '\n\n';
          hastebinMessage += 'Responsible :\n\n';
          hastebinMessage += JSON.stringify(entry.user) + '\n';
          hastebinMessage += entry.user.username + '#' + entry.user.discriminator + ' with id ' + entry.user.id;
          hb = await hastebin(configM.config.hastebinServer, hastebinMessage);
        }
        let finalMessage = a.event.msg.replace('$responsibleId', entry.user.id).replace('$responsible', entry.user.username + '#' + entry.user.discriminator).replace('$emojiId', entry.target.id).replace('$emoji', entry.target.name).replace('$hastebin', hb);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch(e) {
      console.log(e);
    }
  }
  async function guildEmojiUpdate(guild, emojis, oldEmojis) {
    try {
      let a = await dbEI.getEvent(guild.id, 'guildEmojiUpdate');
      if (a.event.d === true) {
        let auditlog = await bot.getGuildAuditLogs(guild.id, 1);
        let entry = auditlog.entries[0];
        let hb = "";
        if (a.event.msg.includes("$hastebin")) {
          let hastebinMessage = 'Gateway info :\n';
          hastebinMessage += 'New emojis array\n\n';
          hastebinMessage += JSON.stringify(emojis) + '\n\n';
          hastebinMessage += 'Old emojis array\n\n';
          hastebinMessage += JSON.stringify(oldEmojis) + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Audit Log Thing !\n\n';
          hastebinMessage += 'State of the emoji before :\n';
          hastebinMessage += JSON.stringify(entry.before) + ' (yep, this time it\'s an update)\n\n';
          hastebinMessage += 'State of the emoji after :\n\n';
          hastebinMessage += JSON.stringify(entry.after) + '\n\n';
          hastebinMessage += 'Full emoji object à la audit log :\n\n';
          hastebinMessage += JSON.stringify(entry.target) + '\n\n';
          hastebinMessage += 'Responsible :\n\n';
          hastebinMessage += JSON.stringify(entry.user) + '\n';
          hastebinMessage += entry.user.username + '#' + entry.user.discriminator + ' with id ' + entry.user.id;
          hb = await hastebin(configM.config.hastebinServer, hastebinMessage);
        }
        let finalMessage = a.event.msg.replace('$responsibleId', entry.user.id).replace('$responsible', entry.user.username + '#' + entry.user.discriminator).replace('$emojiId', oldEmojis[0].id).replace('$emoji', entry.target.name).replace('$hastebin', hb);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch(e) {
      console.log(e);
    }
  }
  async function guildEmojiDelete(guild, emojis, oldEmojis) {
    try {
      let a = await dbEI.getEvent(guild.id, 'guildEmojiDelete');
      if (a.event.d === true) {
        let auditlog = await bot.getGuildAuditLogs(guild.id, 1);
        let entry = auditlog.entries[0];
        let hb = "";
        if (a.event.msg.includes("$hastebin")) {
          let hastebinMessage = 'Gateway info :\n';
          hastebinMessage += 'New emojis array\n\n';
          hastebinMessage += JSON.stringify(emojis) + '\n\n';
          hastebinMessage += 'Old emojis array\n\n';
          hastebinMessage += JSON.stringify(oldEmojis) + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Audit Log:tm: Again:tm: !\n\n';
          hastebinMessage += 'State of the emoji before :\n';
          hastebinMessage += JSON.stringify(entry.before) + '\n\n';
          hastebinMessage += 'State of the emoji after :\n\n';
          hastebinMessage += JSON.stringify(entry.after) + ' (nope again, it\'s a delete event smh)\n\n';
          hastebinMessage += 'Full emoji object à la audit log :\n\n';
          hastebinMessage += JSON.stringify(entry.target) + '\n\n';
          hastebinMessage += 'Responsible :\n\n';
          hastebinMessage += JSON.stringify(entry.user) + '\n';
          hastebinMessage += entry.user.username + '#' + entry.user.discriminator + ' with id ' + entry.user.id;
          hb = await hastebin(configM.config.hastebinServer, hastebinMessage);
        }
        let finalMessage = a.event.msg.replace('$responsibleId', entry.user.id).replace('$responsible', entry.user.username + '#' + entry.user.discriminator).replace('$emojiId', oldEmojis[0].id).replace('$emoji', oldEmojis[0].name).replace('$hastebin', hb);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch(e) {
      console.log(e);
    }
  }
  bot.on('guildEmojisUpdate', async (guild, emojis, oldEmojis) => {
    let auditlog = await bot.getGuildAuditLogs(guild.id, 1);
    let entry = auditlog.entries[0];
    if (entry.actionType === 60) {
      return guildEmojiAdd(guild, emojis, oldEmojis);
    }
    else if (entry.actionType === 61) {
      return guildEmojiUpdate(guild, emojis, oldEmojis);
    }
    else if (entry.actionType === 62) {
      return guildEmojiDelete(guild, emojis, oldEmojis);
    }
  });
  // Add a second identical event for welcome message like memberJoined
  bot.on('guildMemberAdd', async (guild, member) => {
    try {
      let a = await dbEI.getEvent(guild.id, 'guildMemberAdd');
      if (a.event.d === true) {
        let hb = "";
        if (a.event.msg.includes("$hastebin")) {
          let hastebinMessage = 'Gateway info :\n';
          hastebinMessage += 'Member info :\n\n';
          hastebinMessage += JSON.stringify(member);
          hastebinMessage += member.user.username + '#' + member.user.discriminator + ' with id ' + member.user.id;
          hastebinMessage += '---\n\n';
          hastebinMessage += 'No Audit Log time this time lol !\n\n';
          hb = await hastebin(configM.config.hastebinServer, hastebinMessage);
        }
        let finalMessage = a.event.msg.replace('$memberId', member.user.id).replace('$member', member.user.username + '#' + member.user.discriminator).replace('$hastebin', hb);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch(e) {
      console.log(e);
    }
  });
  let lastAuditLogId = '';
  // Maybe make a second thing like guildMemberLeft
  async function guildMemberRemove(guild, member) {
    try {
      let a = await dbEI.getEvent(guild.id, 'guildMemberRemove');
      if (a.event.d === true) {
        let hb = "";
        if (a.event.msg.includes("$hastebin")) {
          let hastebinMessage = 'Gateway info :\n';
          hastebinMessage += 'Member info :\n\n';
          hastebinMessage += JSON.stringify(member) + '\n';
          hastebinMessage += member.user.username + '#' + member.user.discriminator + ' with id ' + member.user.id + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'No Audit Log time this time lol !';
          hb = await hastebin(configM.config.hastebinServer, hastebinMessage);
        }
        let finalMessage = a.event.msg.replace('$memberId', member.user.id).replace('$member', member.user.username + '#' + member.user.discriminator).replace('$hastebin', hb);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch(e) {
      console.log(e);
    }
  }
  // Make a second thing like that for Pollr like mod-log
  async function guildMemberKick(guild, member) {
    try {
      let a = await dbEI.getEvent(guild.id, 'guildMemberKick');
      if (a.event.d === true) {
        let auditlog = await bot.getGuildAuditLogs(guild.id, 1);
        let entry = auditlog.entries[0];
        lastAuditLogId = entry.id;
        let hb = "";
        if (a.event.msg.includes("$hastebin")) {
          let hastebinMessage = 'Gateway info :\n';
          hastebinMessage += 'Member info :\n\n';
          hastebinMessage += JSON.stringify(member) + '\n';
          hastebinMessage += member.user.username + '#' + member.user.discriminator + ' with id ' + member.user.id + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Audit Log Can you see ?\n';
          hastebinMessage += 'Additional information on the kick\n\n';
          hastebinMessage += 'Reason :\n';
          hastebinMessage += entry.reason + '\n\n';
          hastebinMessage += 'Responsible :\n';
          hastebinMessage += JSON.stringify(entry.user) + '\n';
          hastebinMessage += entry.user.username + '#' + entry.user.discriminator + ' with id ' + entry.user.id;
          hb = await hastebin(configM.config.hastebinServer, hastebinMessage);
        }
        let finalMessage = a.event.msg.replace('$responsibleId', entry.user.id).replace('$responsible', entry.user.username + '#' + entry.user.discriminator).replace('$memberId', member.user.id).replace('$member', member.user.username + '#' + member.user.discriminator).replace('$reason', entry.reason).replace('$hastebin', hb);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch(e) {
      console.log(e);
    }
  }
  bot.on('guildMemberRemove', async (guild, member) => {
    try {
      let date = new Date();
      let auditlog = await bot.getGuildAuditLogs(guild.id, 1);
      let entry = auditlog.entries[0];
      if (entry.actionType === 20 && entry.id !== lastAuditLogId) {
        return guildMemberKick(guild, member);
      }
      else if (entry.actionType !== 22) {
        return guildMemberRemove(guild, member);
      }
    }
    catch (e) {
      console.log(e);
    }
  });
};