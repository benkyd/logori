const commandH = require('../commandHandler');
const bot = require('../botClient').bot;
const Eris = require('eris');
const dbEI = require('../dbEventInterface');
const hastebin = require('../hastebin');
const configM = require('../configManager');

// Redo the first events because they're probably fucked up

// Add reason in the events

function buildDiffs(after, before) {
  let str = '';
  let doneKeys = [];
  Object.keys(after).forEach(key => {
    let one = typeof (before[key]) === 'object' ? JSON.stringify(before[key]) : before[key];
    let two = typeof (after[key]) === 'object' ? JSON.stringify(after[key]) : after[key];
    str += key + ' | ' + one + ' -> ' + two + '\n';
    doneKeys.push(key);
  });
  Object.keys(before).forEach(key => {
    if (!doneKeys.includes(key)) {
      let one = typeof (before[key]) === 'object' ? JSON.stringify(before[key]) : before[key];
      let two = typeof (after[key]) === 'object' ? JSON.stringify(after[key]) : after[key];
      str += key + ' | ' + one + ' -> ' + two + '\n';
    }
  });
  return str;
}

function getPermissions(id) {
  let perm = new Eris.Permission(id);
  let goodOnes = [];
  Object.keys(perm.json).forEach(key => {
    if (perm.json[key] === true) {
      goodOnes.push(key);
    }
  });
  return goodOnes;
}

exports.loadModule = function loadModule() {
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
        let hb = '';
        if (a.event.msg.includes("$hastebin")) {
          let hastebinMessage = 'channelCreate event triggered :\n\n';
          hastebinMessage += 'Raw event info :\n\n';
          hastebinMessage += JSON.stringify(channel) + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Responsible User\'s Name : ' + entry.user.username + '#' + entry.user.discriminator + '\n';
          hastebinMessage += 'Responsible User\'s Id : ' + entry.user.id + '\n\n';
          hastebinMessage += 'Channel Name : ' + channel.name + '\n';
          hastebinMessage += 'Channel Id : ' + channel.id + '\n';
          hastebinMessage += 'Channel Type : ' + (channel.type === 0 ? 'Text' : 'Voice') + '\n';
          if (channel.type === 0) {
            hastebinMessage += 'Channel Topic : ' + channel.topic + '\n';
            hastebinMessage += (channel.nsfw === true ? 'Channel is nsfw' : 'Channel is not nsfw') + '\n\n';
          }
          hastebinMessage += 'Reason : ' + entry.reason + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Hyper cool before -> after event thing :\n';
          hastebinMessage += buildDiffs(entry.after, entry.before) + '\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += new Date().toISOString();
          hb = await hastebin(configM.config.hastebinServer, hastebinMessage);
        }
        let type = '';
        if (channel.type === 0) {
          type = "text";
        }
        else {
          type = "voice";
        }
        let finalMessage = a.event.msg.replace('$type', type).replace('$channelId', channel.id).replace('$channel', channel.name).replace('$hastebin', hb).replace('$responsibleId', entry.user.id).replace('$responsible', entry.user.username + '#' + entry.user.discriminator).replace('$reason', entry.reason);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch (e) {
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
        let hb = '';
        if (a.event.msg.includes("$hastebin")) {
          let hastebinMessage = 'channelDelete event triggered :\n\n';
          hastebinMessage += 'Raw event info :\n\n';
          hastebinMessage += JSON.stringify(channel) + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Responsible User\'s Name : ' + entry.user.username + '#' + entry.user.discriminator + '\n';
          hastebinMessage += 'Responsible User\'s Id : ' + entry.user.id + '\n\n';
          hastebinMessage += 'Channel Name : ' + channel.name + '\n';
          hastebinMessage += 'Channel Id : ' + channel.id + '\n';
          hastebinMessage += 'Channel Type : ' + (channel.type === 0 ? 'Text' : 'Voice') + '\n';
          if (channel.type === 0) {
            hastebinMessage += 'Channel Topic : ' + channel.topic + '\n';
            hastebinMessage += (channel.nsfw === true ? 'Channel was nsfw' : 'Channel was not nsfw') + '\n\n';
          }
          hastebinMessage += 'Reason : ' + entry.reason + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Hyper cool before -> after event thing :\n';
          hastebinMessage += buildDiffs(entry.after, entry.before) + '\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += new Date().toISOString();
          hb = await hastebin(configM.config.hastebinServer, hastebinMessage);
        }
        let type = '';
        if (channel.type === 0) {
          type = "text";
        }
        else {
          type = "voice";
        }
        let finalMessage = a.event.msg.replace('$type', type).replace('$channelId', channel.id).replace('$channel', channel.name).replace('$hastebin', hb).replace('$responsibleId', entry.user.id).replace('$responsible', entry.user.username + '#' + entry.user.discriminator).replace('$reason', entry.reason);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch (e) {
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
        let type = '';
        if  (channel.type === 0) {
          type = "text";
        }
        else {
          type = "voice";
        }
        let mention = channel.mention;
        if (channel.type === 2) mention.shift();
        let hb = '';
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
    // Voice channel support (bitrate)
    try {
      let a = await dbEI.getEvent(channel.guild.id, 'channelUpdate');
      if (a.event.d === true) {
        let auditlog = await bot.getGuildAuditLogs(channel.guild.id, 1);
        let entry = auditlog.entries[0];
        let hb = '';
        if (a.event.msg.includes("$hastebin")) {
          let hastebinMessage = 'channelUpdate event triggered :\n\n';
          hastebinMessage += 'Raw event info :\n\n';
          hastebinMessage += JSON.stringify(oldChannel) + '\n\n';
          hastebinMessage += JSON.stringify(channel) + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Responsible User\'s Name : ' + entry.user.username + '#' + entry.user.discriminator + '\n';
          hastebinMessage += 'Responsible User\'s Id : ' + entry.user.id + '\n\n';
          hastebinMessage += 'Channel Id : ' + channel.id + '\n';
          hastebinMessage += 'Channel Type : ' + (channel.type === 0 ? 'Text' : 'Voice') + '\n\n';
          hastebinMessage += 'Old Channel Name : ' + oldChannel.name + '\n';
          if (channel.type === 0) {
            hastebinMessage += 'Old Channel Topic : ' + oldChannel.topic + '\n';
            hastebinMessage += (oldChannel.nsfw === true ? 'Old Channel was nsfw' : 'Old Channel was not nsfw') + '\n\n';
          }
          hastebinMessage += 'Updated Channel Name : ' + channel.name + '\n';
          if (channel.type === 0) {
            hastebinMessage += 'Updated Channel Topic : ' + channel.topic + '\n';
            hastebinMessage += (channel.nsfw === true ? 'Updated Channel is nsfw' : 'Updated Channel is not nsfw') + '\n\n';
          }
          hastebinMessage += 'Reason : ' + entry.reason + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Hyper cool before -> after event thing :\n';
          hastebinMessage += buildDiffs(entry.after, entry.before) + '\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += new Date().toISOString();
          hb = await hastebin(configM.config.hastebinServer, hastebinMessage);
        }
        let type = '';
        if (channel.type === 0) {
          type = "text";
        }
        else {
          type = "voice";
        }
        let finalMessage = a.event.msg.replace('$type', type).replace('$oldChannel', oldChannel.name).replace('$channelId', channel.id).replace('$channel', channel.name).replace('$hastebin', hb).replace('$responsibleId', entry.user.id).replace('$responsible', entry.user.username + '#' + entry.user.discriminator).replace('$reason', entry.reason);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch (e) {
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
        let hb = '';
        if (a.event.msg.includes("$hastebin")) {
          let hastebinMessage = 'guildBanAdd event triggered :\n\n';
          hastebinMessage += 'Raw event info :\n\n';
          hastebinMessage += JSON.stringify(user) + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Responsible User\'s Name : ' + entry.user.username + '#' + entry.user.discriminator + '\n';
          hastebinMessage += 'Responsible User\'s Id : ' + entry.user.id + '\n\n';
          hastebinMessage += 'Banned User\'s Name : ' + user.username + '#' + user.discriminator + '\n';
          hastebinMessage += 'Banned User\'s Id : ' + entry.user.id + '\n\n';
          hastebinMessage += 'Reason : ' + entry.reason + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += new Date().toISOString();
          hb = await hastebin(configM.config.hastebinServer, hastebinMessage);
        }
        let finalMessage = a.event.msg.replace('$bannedId', user.id).replace('$banned', user.username + '#' + user.discriminator).replace('$hastebin', hb).replace('$responsibleId', entry.user.id).replace('$responsible', entry.user.username + '#' + entry.user.discriminator).replace('$reason', entry.reason);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch (e) {
      console.log(e);
    }
  });
  bot.on('guildBanRemove', async (guild, user) => {
    try {
      let a = await dbEI.getEvent(guild.id, 'guildBanRemove');
      if (a.event.d === true) {
        let auditlog = await bot.getGuildAuditLogs(guild.id, 1);
        let entry = auditlog.entries[0];
        let hb = '';
        if (a.event.msg.includes("$hastebin")) {
          let hastebinMessage = 'guildBanRemove event triggered :\n\n';
          hastebinMessage += 'Raw event info :\n\n';
          hastebinMessage += JSON.stringify(user) + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Responsible User\'s Name : ' + entry.user.username + '#' + entry.user.discriminator + '\n';
          hastebinMessage += 'Responsible User\'s Id : ' + entry.user.id + '\n\n';
          hastebinMessage += 'Unbanned User\'s Name : ' + user.username + '#' + user.discriminator + '\n';
          hastebinMessage += 'Unbanned User\'s Id : ' + entry.user.id + '\n\n';
          hastebinMessage += 'Reason : ' + entry.reason + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += new Date().toISOString();
          hb = await hastebin(configM.config.hastebinServer, hastebinMessage);
        }
        let finalMessage = a.event.msg.replace('$unbannedId', user.id).replace('$unbanned', user.username + '#' + user.discriminator).replace('$hastebin', hb).replace('$responsibleId', entry.user.id).replace('$responsible', entry.user.username + '#' + entry.user.discriminator).replace('$reason', entry.reason);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch (e) {
      console.log(e);
    }
  });
  async function guildEmojiAdd(guild, emojis, oldEmojis) {
    try {
      let a = await dbEI.getEvent(guild.id, 'guildEmojiAdd');
      if (a.event.d === true) {
        let auditlog = await bot.getGuildAuditLogs(guild.id, 1);
        let entry = auditlog.entries[0];
        let hb = '';
        if (a.event.msg.includes("$hastebin")) {
          let hastebinMessage = 'guildEmojiAdd event triggered :\n\n';
          hastebinMessage += 'Raw event info :\n\n';
          hastebinMessage += JSON.stringify(oldEmojis) + '\n\n';
          hastebinMessage += JSON.stringify(emojis) + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Responsible User\'s Name : ' + entry.user.username + '#' + entry.user.discriminator + '\n';
          hastebinMessage += 'Responsible User\'s Id : ' + entry.user.id + '\n\n';
          hastebinMessage += 'Emoji Name : ' + entry.target.name + '\n';
          hastebinMessage += 'Emoji Id : ' + entry.target.id + '\n\n';
          hastebinMessage += 'Reason : ' + entry.reason + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Hyper cool before -> after event thing :\n';
          hastebinMessage += buildDiffs(entry.after, entry.before) + '\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += new Date().toISOString();
          hb = await hastebin(configM.config.hastebinServer, hastebinMessage);
        }
        let finalMessage = a.event.msg.replace('$emojiId', entry.target.id).replace('$emoji', entry.target.name).replace('$hastebin', hb).replace('$responsibleId', entry.user.id).replace('$responsible', entry.user.username + '#' + entry.user.discriminator).replace('$reason', entry.reason);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch (e) {
      console.log(e);
    }
  }
  async function guildEmojiUpdate(guild, emojis, oldEmojis) {
    try {
      let a = await dbEI.getEvent(guild.id, 'guildEmojiUpdate');
      if (a.event.d === true) {
        let auditlog = await bot.getGuildAuditLogs(guild.id, 1);
        let entry = auditlog.entries[0];
        let hb = '';
        if (a.event.msg.includes("$hastebin")) {
          let hastebinMessage = 'guildEmojiUpdate event triggered :\n\n';
          hastebinMessage += 'Raw event info :\n\n';
          hastebinMessage += JSON.stringify(oldEmojis) + '\n\n';
          hastebinMessage += JSON.stringify(emojis) + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Responsible User\'s Name : ' + entry.user.username + '#' + entry.user.discriminator + '\n';
          hastebinMessage += 'Responsible User\'s Id : ' + entry.user.id + '\n\n';
          hastebinMessage += 'Emoji Id : ' + entry.target.id + '\n\n';
          hastebinMessage += 'Updated Emoji Name : ' + entry.after.name + '\n\n';
          hastebinMessage += 'Old Emoji Name : ' + entry.before.name + '\n\n';
          hastebinMessage += 'Reason : ' + entry.reason + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Hyper cool before -> after event thing :\n';
          hastebinMessage += buildDiffs(entry.after, entry.before) + '\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += new Date().toISOString();
          hb = await hastebin(configM.config.hastebinServer, hastebinMessage);
        }
        let finalMessage = a.event.msg.replace('$emojiId', entry.target.id).replace('$emoji', entry.target.name).replace('$oldEmoji', entry.before.name).replace('$hastebin', hb).replace('$responsibleId', entry.user.id).replace('$responsible', entry.user.username + '#' + entry.user.discriminator).replace('$reason', entry.reason);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch (e) {
      console.log(e);
    }
  }
  async function guildEmojiDelete(guild, emojis, oldEmojis) {
    try {
      let a = await dbEI.getEvent(guild.id, 'guildEmojiDelete');
      if (a.event.d === true) {
        let auditlog = await bot.getGuildAuditLogs(guild.id, 1);
        let entry = auditlog.entries[0];
        let hb = '';
        if (a.event.msg.includes("$hastebin")) {
          let hastebinMessage = 'guildEmojiDelete event triggered :\n\n';
          hastebinMessage += 'Raw event info :\n\n';
          hastebinMessage += JSON.stringify(oldEmojis) + '\n\n';
          hastebinMessage += JSON.stringify(emojis) + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Responsible User\'s Name : ' + entry.user.username + '#' + entry.user.discriminator + '\n';
          hastebinMessage += 'Responsible User\'s Id : ' + entry.user.id + '\n\n';
          hastebinMessage += 'Deleted Emoji Name : ' + entry.target.name + '\n';
          hastebinMessage += 'Deleted Emoji Id : ' + entry.target.id + '\n\n';
          hastebinMessage += 'Reason : ' + entry.reason + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Hyper cool before -> after event thing :\n';
          hastebinMessage += buildDiffs(entry.after, entry.before) + '\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += new Date().toISOString();
          hb = await hastebin(configM.config.hastebinServer, hastebinMessage);
        }
        let finalMessage = a.event.msg.replace('$emojiId', entry.target.id).replace('$emoji', entry.target.name).replace('$hastebin', hb).replace('$responsibleId', entry.user.id).replace('$responsible', entry.user.username + '#' + entry.user.discriminator).replace('$reason', entry.reason);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch (e) {
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
        let hb = '';
        if (a.event.msg.includes("$hastebin")) {
          let hastebinMessage = 'guildMemberAdd event triggered :\n\n';
          hastebinMessage += 'Raw event info :\n\n';
          hastebinMessage += JSON.stringify(member) + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'New Member\'s Name : ' + member.user.username + '#' + member.user.discriminator + '\n';
          hastebinMessage += 'New Member\'s Id : ' + member.user.id + '\n';
          hastebinMessage += (member.user.bot ? 'New member is a bot' : 'New member is not a bot') + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += new Date().toISOString();
          hb = await hastebin(configM.config.hastebinServer, hastebinMessage);
        }
        let finalMessage = a.event.msg.replace('$memberId', member.user.id).replace('$member', member.user.username + '#' + member.user.discriminator).replace('$hastebin', hb);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch (e) {
      console.log(e);
    }
  });
  let lastKickAuditLogId = {};
  // Maybe make a second thing like guildMemberLeft
  async function guildMemberRemove(guild, member) {
    try {
      let a = await dbEI.getEvent(guild.id, 'guildMemberRemove');
      if (a.event.d === true) {
        let hb = '';
        if (a.event.msg.includes("$hastebin")) {
          let hastebinMessage = 'guildMemberRemove event triggered :\n\n';
          hastebinMessage += 'Raw event info :\n\n';
          hastebinMessage += JSON.stringify(member) + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Member\'s Name : ' + member.user.username + '#' + member.user.discriminator + '\n';
          hastebinMessage += 'Member\'s Id : ' + member.user.id + '\n';
          hastebinMessage += (member.user.bot ? 'Member was a bot' : 'Member was not a bot') + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += new Date().toISOString();
          hb = await hastebin(configM.config.hastebinServer, hastebinMessage);
        }
        let finalMessage = a.event.msg.replace('$memberId', member.user.id).replace('$member', member.user.username + '#' + member.user.discriminator).replace('$hastebin', hb);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch (e) {
      console.log(e);
    }
  }
  // Make a second thing like that for Pollr like mod-log
  async function guildMemberKick(guild, member, auditlog) {
    try {
      let a = await dbEI.getEvent(guild.id, 'guildMemberKick');
      if (a.event.d === true) {
        let entry = auditlog.entries[0];
        let hb = '';
        if (a.event.msg.includes("$hastebin")) {
          let hastebinMessage = 'guildMemberKick event triggered :\n\n';
          hastebinMessage += 'Raw event info :\n\n';
          hastebinMessage += JSON.stringify(member) + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Responsible User\'s Name : ' + entry.user.username + '#' + entry.user.discriminator + '\n';
          hastebinMessage += 'Responsible User\'s Id : ' + entry.user.id + '\n\n';
          hastebinMessage += 'Kicked User\'s Name : ' + member.user.username + '#' + member.user.discriminator + '\n';
          hastebinMessage += 'Kicked User\'s Id : ' + member.user.id + '\n\n';
          hastebinMessage += 'Reason : ' + entry.reason + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += new Date().toISOString();
          hb = await hastebin(configM.config.hastebinServer, hastebinMessage);
        }
        let finalMessage = a.event.msg.replace('$kickedId', member.user.id).replace('$kicked', member.user.username + '#' + member.user.discriminator).replace('$hastebin', hb).replace('$responsibleId', entry.user.id).replace('$responsible', entry.user.username + '#' + entry.user.discriminator).replace('$reason', entry.reason);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch (e) {
      console.log(e);
    }
  }
  bot.on('guildMemberRemove', async (guild, member) => {
    try {
      let date = new Date();
      let auditlog = await bot.getGuildAuditLogs(guild.id, 1);
      let entry = auditlog.entries[0];
      if (entry.actionType === 20 && entry.id !== lastAuditLogId[guild.id]) {
        return guildMemberKick(guild, member, auditlog);
      }
      else if (entry.actionType !== 22) {
        return guildMemberRemove(guild, member);
      }
    }
    catch (e) {
      console.log(e);
    }
  });
  bot.on('guildMemberUpdate', async (guild, member, oldMember) => {
    try {
      let a = await dbEI.getEvent(guild.id, 'guildMemberUpdate');
      if (a.event.d === true) {
        let auditlog = await bot.getGuildAuditLogs(guild.id, 1);
        let entry = auditlog.entries[0];
        let hb = '';
        let diffs = '';
        if (a.event.msg.includes("$hastebin") || a.event.msg.includes("$recapitulative")) {
          diffs = buildDiffs(entry.after, entry.before);
        }
        if (a.event.msg.includes("$hastebin")) {
          let hastebinMessage = 'guildMemberUpdate event triggered :\n\n';
          hastebinMessage += 'Raw event info :\n\n';
          hastebinMessage += JSON.stringify(oldMember) + '\n\n';
          hastebinMessage += JSON.stringify(member) + '\n\n';
          hastebinMessage += '---\n\n';
          if (entry.user !== member.user) {
            hastebinMessage += 'Responsible User\'s Name : ' + entry.user.username + '#' + entry.user.discriminator + '\n';
            hastebinMessage += 'Responsible User\'s Id : ' + entry.user.id + '\n\n';
          }
          hastebinMessage += 'Member\'s Name : ' + member.user.username + '#' + member.user.discriminator + '\n';
          hastebinMessage += 'Member\'s Id : ' + member.user.id + '\n';
          hastebinMessage += 'Member\'s Nickname : ' + member.nick + '\n\n';
          hastebinMessage += 'Reason : ' + entry.reason + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Hyper cool before -> after event thing :\n';
          hastebinMessage += diffs + '\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += new Date().toISOString();
          hb = await hastebin(configM.config.hastebinServer, hastebinMessage);
        }
        let finalMessage = a.event.msg.replace('$memberId', member.user.id).replace('$member', member.user.username).replace('$hastebin', hb).replace('$responsibleId', entry.user.id).replace('$responsible', entry.user.username + '#' + entry.user.discriminator).replace('$reason', entry.reason).replace('$recapitulative', diffs);;
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch (e) {
      console.log(e);
    }
  });
  bot.on('guildRoleCreate', async (guild, role) => {
    try {
      let a = await dbEI.getEvent(guild.id, 'guildRoleCreate');
      if (a.event.d === true) {
        let auditlog = await bot.getGuildAuditLogs(guild.id, 1);
        let entry = auditlog.entries[0];
        let hb = '';
        if (a.event.msg.includes("$hastebin")) {
          let hastebinMessage = 'guildRoleCreate event triggered :\n\n';
          hastebinMessage += 'Raw event info :\n\n';
          hastebinMessage += JSON.stringify(role) + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Responsible User\'s Name : ' + entry.user.username + '#' + entry.user.discriminator + '\n';
          hastebinMessage += 'Responsible User\'s Id : ' + entry.user.id + '\n\n';
          hastebinMessage += 'Role Name : ' + role.name + '\n';
          hastebinMessage += 'Role Id : ' + role.id + '\n\n';
          hastebinMessage += 'Reason : ' + entry.reason + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Permissions :\n\n';
          hastebinMessage += getPermissions(role.permissions.allow).join(',\n') + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Hyper cool before -> after event thing :\n';
          hastebinMessage += buildDiffs(entry.after, entry.before) + '\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += new Date().toISOString();
          hb = await hastebin(configM.config.hastebinServer, hastebinMessage);
        }
        let finalMessage = a.event.msg.replace('$roleId', role.id).replace('$role', role.name).replace('$hastebin', hb).replace('$responsibleId', entry.user.id).replace('$responsible', entry.user.username + '#' + entry.user.discriminator).replace('$reason', entry.reason);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch (e) {
      console.log(e);
    }
  });
  bot.on('guildRoleDelete', async (guild, role) => {
    try {
      let a = await dbEI.getEvent(guild.id, 'guildRoleDelete');
      if (a.event.d === true) {
        let auditlog = await bot.getGuildAuditLogs(guild.id, 1);
        let entry = auditlog.entries[0];
        let hb = '';
        if (a.event.msg.includes("$hastebin")) {
          let hastebinMessage = 'guildRoleDelete event triggered :\n\n';
          hastebinMessage += 'Raw event info :\n\n';
          hastebinMessage += JSON.stringify(role) + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Responsible User\'s Name : ' + entry.user.username + '#' + entry.user.discriminator + '\n';
          hastebinMessage += 'Responsible User\'s Id : ' + entry.user.id + '\n\n';
          hastebinMessage += 'Old Role Name : ' + role.name + '\n';
          hastebinMessage += 'Old Role Id : ' + role.id + '\n\n';
          hastebinMessage += 'Reason : ' + entry.reason + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Permissions :\n\n';
          hastebinMessage += getPermissions(role.permissions.allow).join(',\n') + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Hyper cool before -> after event thing :\n';
          hastebinMessage += buildDiffs(entry.after, entry.before) + '\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += new Date().toISOString();
          hb = await hastebin(configM.config.hastebinServer, hastebinMessage);
        }
        let finalMessage = a.event.msg.replace('$roleId', role.id).replace('$role', role.name).replace('$hastebin', hb).replace('$responsibleId', entry.user.id).replace('$responsible', entry.user.username + '#' + entry.user.discriminator).replace('$reason', entry.reason);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch (e) {
      console.log(e);
    }
  });
  bot.on('guildRoleUpdate', async (guild, role, oldRole) => {
    try {
      let a = await dbEI.getEvent(guild.id, 'guildRoleUpdate');
      if (a.event.d === true) {
        let auditlog = await bot.getGuildAuditLogs(guild.id, 1);
        let entry = auditlog.entries[0];
        let hb = '';
        if (a.event.msg.includes("$hastebin")) {
          let hastebinMessage = 'guildRoleUpdate event triggered :\n\n';
          hastebinMessage += 'Raw event info :\n\n';
          hastebinMessage += JSON.stringify(oldRole) + '\n\n';
          hastebinMessage += JSON.stringify(role) + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Responsible User\'s Name : ' + entry.user.username + '#' + entry.user.discriminator + '\n';
          hastebinMessage += 'Responsible User\'s Id : ' + entry.user.id + '\n\n';
          hastebinMessage += 'Role Id : ' + role.id + '\n\n';
          hastebinMessage += 'Old Role Name : ' + oldRole.name + '\n\n';
          hastebinMessage += 'Updated Role Name : ' + role.name + '\n\n';
          hastebinMessage += 'Reason : ' + entry.reason + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Old Role Permissions :\n\n';
          hastebinMessage += getPermissions(oldRole.permissions.allow).join(',\n') + '\n\n';
          hastebinMessage += 'Updated Role Permissions :\n\n';
          hastebinMessage += getPermissions(role.permissions.allow).join(',\n') + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Hyper cool before -> after event thing :\n';
          hastebinMessage += buildDiffs(entry.after, entry.before) + '\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += new Date().toISOString();
          hb = await hastebin(configM.config.hastebinServer, hastebinMessage);
        }
        let finalMessage = a.event.msg.replace('$roleId', role.id).replace('$role', role.name).replace('$hastebin', hb).replace('$responsibleId', entry.user.id).replace('$responsible', entry.user.username + '#' + entry.user.discriminator).replace('$reason', entry.reason);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch (e) {
      console.log(e);
    }
  });
  bot.on('guildUpdate', async (guild, oldGuild) => {
    try {
      let a = await dbEI.getEvent(guild.id, 'guildUpdate');
      if (a.event.d === true) {
        let auditlog = await bot.getGuildAuditLogs(guild.id, 1);
        let entry = auditlog.entries[0];
        let hb = '';
        if (a.event.msg.includes("$hastebin")) {
          let hastebinMessage = 'guildUpdate event triggered :\n\n';
          hastebinMessage += 'Raw event info :\n\n';
          hastebinMessage += JSON.stringify(oldGuild) + '\n\n';
          hastebinMessage += JSON.stringify(guild) + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Responsible User\'s Name : ' + entry.user.username + '#' + entry.user.discriminator + '\n';
          hastebinMessage += 'Responsible User\'s Id : ' + entry.user.id + '\n\n';
          hastebinMessage += 'Guild Id : ' + guild.id + '\n';
          hastebinMessage += (guild.large ? 'The Guild is a large guild' : 'The Guild is not large') + '\n';
          hastebinMessage += 'Guild Owner\'s Id : ' + guild.ownerID +  '\n';
          hastebinMessage += 'Guild Verification Level : ' + guild.verificationLevel +  '\n';
          hastebinMessage += 'Guild Member Count : ' + guild.memberCount +  '\n\n';
          hastebinMessage += 'Old Guild Name : ' + oldGuild.name + '\n\n';
          hastebinMessage += 'Updated Guild Name : ' + guild.name + '\n\n';
          hastebinMessage += 'Reason : ' + entry.reason + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Hyper cool before -> after event thing :\n';
          hastebinMessage += buildDiffs(entry.after, entry.before) + '\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += new Date().toISOString();
          hb = await hastebin(configM.config.hastebinServer, hastebinMessage);
        }
        let finalMessage = a.event.msg.replace('$guildId', guild.id).replace('$guild', guild.name).replace('$oldGuild', oldGuild.name).replace('$hastebin', hb).replace('$responsibleId', entry.user.id).replace('$responsible', entry.user.username + '#' + entry.user.discriminator).replace('$reason', entry.reason);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch (e) {
      console.log(e);
    }
  });
  bot.on('messageDelete', async (message) => {
    try {
      let a = await dbEI.getEvent(message.channel.guild.id, 'messageDelete');
      if (a.event.d === true) {
        let auditlog = await bot.getGuildAuditLogs(message.channel.guild.id, 1);
        let entry = auditlog.entries[0];
        let hb = '';
        if (a.event.msg.includes("$hastebin")) {
          let hastebinMessage = 'messageDelete event triggered :\n\n';
          hastebinMessage += 'Raw event info :\n\n';
          hastebinMessage += JSON.stringify(message) + '\n\n';
          hastebinMessage += '---\n\n';
          if (entry.actionType === 72) {
            hastebinMessage += 'Responsible User\'s Name : ' + entry.user.username + '#' + entry.user.discriminator + '\n';
            hastebinMessage += 'Responsible User\'s Id : ' + entry.user.id + '\n';
            hastebinMessage += 'Reason : ' + entry.reason + '\n\n';
          }
          else {
            hastebinMessage += 'Member has deleted himself the message\n\n';
          }
          hastebinMessage += 'Message Author\'s Name : ' + message.author.username + '#' + message.author.discriminator + '\n';
          hastebinMessage += 'Message Author\'s Id : ' + message.author.id + '\n\n';
          hastebinMessage += 'Message Channel Name : ' + message.channel.name + '\n';
          hastebinMessage += 'Message Channel Id : ' + message.channel.id + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Content :\n\n';
          hastebinMessage += message.content + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += new Date().toISOString();
          hb = await hastebin(configM.config.hastebinServer, hastebinMessage);
        }
        let finalMessage = a.event.msg.replace('$messageId', message.id).replace('$channelId', message.channel.id).replace('$channel', message.channel.name).replace('$authorId', message.author.id).replace('$author', message.author.username).replace('$hastebin', hb);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch (e) {
      console.log(e);
    }
  });
  bot.on('messageUpdate', async (message, oldMessage) => {
    try {
      let a = await dbEI.getEvent(message.channel.guild.id, 'messageUpdate');
      if (a.event.d === true) {
        let hb = '';
        if (a.event.msg.includes("$hastebin")) {
          let hastebinMessage = 'messageUpdate event triggered :\n\n';
          hastebinMessage += 'Raw event info :\n\n';
          hastebinMessage += JSON.stringify(oldMessage) + '\n\n';
          hastebinMessage += JSON.stringify(message) + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Message Author\'s Name : ' + message.author.username + '#' + message.author.discriminator + '\n';
          hastebinMessage += 'Message Author\'s Id : ' + message.author.id + '\n\n';
          hastebinMessage += 'Message Channel Name : ' + message.channel.name + '\n';
          hastebinMessage += 'Message Channel Id : ' + message.channel.id + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Old Content :\n\n';
          hastebinMessage += oldMessage.content + '\n\n';
          hastebinMessage += 'Updated Content :\n\n';
          hastebinMessage += message.content + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += new Date().toISOString();
          hb = await hastebin(configM.config.hastebinServer, hastebinMessage);
        }
        let finalMessage = a.event.msg.replace('$messageId', message.id).replace('$channelId', message.channel.id).replace('$channel', message.channel.name).replace('$authorId', message.author.id).replace('$author', message.author.username).replace('$hastebin', hb);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch (e) {
      console.log(e);
    }
  });
};