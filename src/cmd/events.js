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
    try {
      let a = await dbEI.getEvent(channel.guild.id, 'channelCreate');
      if (a.event.d === true) {
        let auditlog = await bot.getGuildAuditLogs(channel.guild.id, 1);
        let entry = auditlog.entries[0];
        let hb = '';
        if (a.event.msg.includes('$hastebin')) {
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
        let finalMessage = a.event.msg.replace(/\$type/g, type).replace(/\$channelId/g, channel.id).replace(/\$channel/g, channel.name).replace(/\$hastebin/g, hb).replace(/\$responsibleId/g, entry.user.id).replace(/\$responsible/g, entry.user.username + '#' + entry.user.discriminator).replace(/\$reason/g, entry.reason);
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
        if (a.event.msg.includes('$hastebin')) {
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
        let finalMessage = a.event.msg.replace(/\$type/g, type).replace(/\$channelId/g, channel.id).replace(/\$channel/g, channel.name).replace(/\$hastebin/g, hb).replace(/\$responsibleId/g, entry.user.id).replace(/\$responsible/g, entry.user.username + '#' + entry.user.discriminator).replace(/\$reason/g, entry.reason);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch (e) {
      console.log(e);
    }
  });
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
        if (a.event.msg.includes('$hastebin')) {
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
        let finalMessage = a.event.msg.replace(/\$type/g, type).replace(/\$oldChannel/g, oldChannel.name).replace(/\$channelId/g, channel.id).replace(/\$channel/g, channel.name).replace(/\$hastebin/g, hb).replace(/\$responsibleId/g, entry.user.id).replace(/\$responsible/g, entry.user.username + '#' + entry.user.discriminator).replace(/\$reason/g, entry.reason);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch (e) {
      console.log(e);
    }
  });
  async function shameBan(guild, user, auditlog) {
    try {
      let a = await dbEI.getEvent(guild.id, 'shameBan');
      if (a.event.d === true) {
        let entry = auditlog.entries[0];
        let hb = '';
        if (a.event.msg.includes('$hastebin')) {
          let hastebinMessage = 'shameBan event triggered :\n\n';
          hastebinMessage += 'Raw event info :\n\n';
          hastebinMessage += JSON.stringify(user) + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Responsible User\'s Name : ' + entry.user.username + '#' + entry.user.discriminator + '\n';
          hastebinMessage += 'Responsible User\'s Id : ' + entry.user.id + '\n\n';
          hastebinMessage += 'Case : ' + a.modCase + '\n\n';
          hastebinMessage += 'Banned User\'s Name : ' + user.username + '#' + user.discriminator + '\n';
          hastebinMessage += 'Banned User\'s Id : ' + entry.user.id + '\n\n';
          hastebinMessage += 'Reason : ' + entry.reason + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += new Date().toISOString();
          hb = await hastebin(configM.config.hastebinServer, hastebinMessage);
        }
        let finalMessage = a.event.msg.replace(/\$bannedId/g, user.id).replace(/\$banned/g, user.username + '#' + user.discriminator).replace(/\$hastebin/g, hb).replace(/\$responsibleId/g, entry.user.id).replace(/\$responsible/g, entry.user.username + '#' + entry.user.discriminator).replace(/\$reason/g, entry.reason).replace(/\$case/g, a.modCase);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch (e) {
      console.log(e);
    }
  }
  async function pollrLikeBan(guild, user, auditlog) {
    try {
      let a = await dbEI.getEvent(guild.id, 'pollrLikeBan');
      if (a.event.d === true) {
        let entry = auditlog.entries[0];
        let hb = '';
        if (a.event.msg.includes('$hastebin')) {
          let hastebinMessage = 'pollrLikeBan event triggered :\n\n';
          hastebinMessage += 'Raw event info :\n\n';
          hastebinMessage += JSON.stringify(user) + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Responsible User\'s Name : ' + entry.user.username + '#' + entry.user.discriminator + '\n';
          hastebinMessage += 'Responsible User\'s Id : ' + entry.user.id + '\n\n';
          hastebinMessage += 'Case : ' + a.modCase + '\n\n';
          hastebinMessage += 'Banned User\'s Name : ' + user.username + '#' + user.discriminator + '\n';
          hastebinMessage += 'Banned User\'s Id : ' + entry.user.id + '\n\n';
          hastebinMessage += 'Reason : ' + entry.reason + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += new Date().toISOString();
          hb = await hastebin(configM.config.hastebinServer, hastebinMessage);
        }
        let finalMessage = a.event.msg.replace(/\$bannedId/g, user.id).replace(/\$banned/g, user.username + '#' + user.discriminator).replace(/\$hastebin/g, hb).replace(/\$responsibleId/g, entry.user.id).replace(/\$responsible/g, entry.user.username + '#' + entry.user.discriminator).replace(/\$reason/g, entry.reason).replace(/\$case/g, a.modCase);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
        dbEI.incrementModCase(guild.id);
      }
    }
    catch (e) {
      console.log(e);
    }
  }
  bot.on('guildBanAdd', async (guild, user) => {
    try {
      let auditlog = await bot.getGuildAuditLogs(guild.id, 1);
      let a = await dbEI.getEvent(guild.id, 'guildBanAdd');
      if (a.event.d === true) {
        let entry = auditlog.entries[0];
        let hb = '';
        if (a.event.msg.includes('$hastebin')) {
          let hastebinMessage = 'guildBanAdd event triggered :\n\n';
          hastebinMessage += 'Raw event info :\n\n';
          hastebinMessage += JSON.stringify(user) + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Responsible User\'s Name : ' + entry.user.username + '#' + entry.user.discriminator + '\n';
          hastebinMessage += 'Responsible User\'s Id : ' + entry.user.id + '\n\n';
          hastebinMessage += 'Case : ' + a.modCase + '\n\n';
          hastebinMessage += 'Banned User\'s Name : ' + user.username + '#' + user.discriminator + '\n';
          hastebinMessage += 'Banned User\'s Id : ' + entry.user.id + '\n\n';
          hastebinMessage += 'Reason : ' + entry.reason + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += new Date().toISOString();
          hb = await hastebin(configM.config.hastebinServer, hastebinMessage);
        }
        let finalMessage = a.event.msg.replace(/\$bannedId/g, user.id).replace(/\$banned/g, user.username + '#' + user.discriminator).replace(/\$hastebin/g, hb).replace(/\$responsibleId/g, entry.user.id).replace(/\$responsible/g, entry.user.username + '#' + entry.user.discriminator).replace(/\$reason/g, entry.reason).replace(/\$case/g, a.modCase);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
      shameBan(guild, user, auditlog);
      pollrLikeBan(guild, user, auditlog);
    }
    catch (e) {
      console.log(e);
    }
  });
  async function pollrLikeUnban(guild, user, auditlog) {
    try {
      let a = await dbEI.getEvent(guild.id, 'pollrLikeUnban');
      if (a.event.d === true) {
        let entry = auditlog.entries[0];
        let hb = '';
        if (a.event.msg.includes('$hastebin')) {
          let hastebinMessage = 'pollrLikeUnban event triggered :\n\n';
          hastebinMessage += 'Raw event info :\n\n';
          hastebinMessage += JSON.stringify(user) + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Responsible User\'s Name : ' + entry.user.username + '#' + entry.user.discriminator + '\n';
          hastebinMessage += 'Responsible User\'s Id : ' + entry.user.id + '\n\n';
          hastebinMessage += 'Case : ' + a.modCase + '\n\n';
          hastebinMessage += 'Unbanned User\'s Name : ' + user.username + '#' + user.discriminator + '\n';
          hastebinMessage += 'Unbanned User\'s Id : ' + entry.user.id + '\n\n';
          hastebinMessage += 'Reason : ' + entry.reason + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += new Date().toISOString();
          hb = await hastebin(configM.config.hastebinServer, hastebinMessage);
        }
        let finalMessage = a.event.msg.replace(/\$unbannedId/g, user.id).replace(/\$unbanned/g, user.username + '#' + user.discriminator).replace(/\$hastebin/g, hb).replace(/\$responsibleId/g, entry.user.id).replace(/\$responsible/g, entry.user.username + '#' + entry.user.discriminator).replace(/\$reason/g, entry.reason).replace(/\$case/g, a.modCase);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
        dbEI.incrementModCase(guild.id);
      }
    }
    catch (e) {
      console.log(e);
    }
  }
  bot.on('guildBanRemove', async (guild, user) => {
    try {
      let auditlog = await bot.getGuildAuditLogs(guild.id, 1);
      let a = await dbEI.getEvent(guild.id, 'guildBanRemove');
      if (a.event.d === true) {
        let entry = auditlog.entries[0];
        let hb = '';
        if (a.event.msg.includes('$hastebin')) {
          let hastebinMessage = 'guildBanRemove event triggered :\n\n';
          hastebinMessage += 'Raw event info :\n\n';
          hastebinMessage += JSON.stringify(user) + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Responsible User\'s Name : ' + entry.user.username + '#' + entry.user.discriminator + '\n';
          hastebinMessage += 'Responsible User\'s Id : ' + entry.user.id + '\n\n';
          hastebinMessage += 'Case : ' + a.modCase + '\n\n';
          hastebinMessage += 'Unbanned User\'s Name : ' + user.username + '#' + user.discriminator + '\n';
          hastebinMessage += 'Unbanned User\'s Id : ' + entry.user.id + '\n\n';
          hastebinMessage += 'Reason : ' + entry.reason + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += new Date().toISOString();
          hb = await hastebin(configM.config.hastebinServer, hastebinMessage);
        }
        let finalMessage = a.event.msg.replace(/\$unbannedId/g, user.id).replace(/\$unbanned/g, user.username + '#' + user.discriminator).replace(/\$hastebin/g, hb).replace(/\$responsibleId/g, entry.user.id).replace(/\$responsible/g, entry.user.username + '#' + entry.user.discriminator).replace(/\$reason/g, entry.reason).replace(/\$case/g, a.modCase);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
      pollrLikeUnban(guild, user, auditlog);
    }
    catch (e) {
      console.log(e);
    }
  });
  async function memberJoin(guild, member) {
    try {
      let a = await dbEI.getEvent(guild.id, 'memberJoin');
      if (a.event.d === true) {
        let hb = '';
        if (a.event.msg.includes('$hastebin')) {
          let hastebinMessage = 'memberJoin event triggered :\n\n';
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
        let finalMessage = a.event.msg.replace(/\$memberId/g, member.user.id).replace(/\$member/g, member.user.username + '#' + member.user.discriminator).replace(/\$hastebin/g, hb);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch (e) {
      console.log(e);
    }
  }
  bot.on('guildMemberAdd', async (guild, member) => {
    try {
      let a = await dbEI.getEvent(guild.id, 'guildMemberAdd');
      if (a.event.d === true) {
        let hb = '';
        if (a.event.msg.includes('$hastebin')) {
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
        let finalMessage = a.event.msg.replace(/\$memberId/g, member.user.id).replace(/\$member/g, member.user.username + '#' + member.user.discriminator).replace(/\$hastebin/g, hb);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
      memberJoin(guild, member);
    }
    catch (e) {
      console.log(e);
    }
  });
  let lastKickAuditLogId = {};
  // Maybe make a second thing like guildMemberLeft
  async function memberLeft(guild, member) {
    try {
      let a = await dbEI.getEvent(guild.id, 'memberLeft');
      if (a.event.d === true) {
        let hb = '';
        if (a.event.msg.includes('$hastebin')) {
          let hastebinMessage = 'memberLeft event triggered :\n\n';
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
        let finalMessage = a.event.msg.replace(/\$memberId/g, member.user.id).replace(/\$member/g, member.user.username + '#' + member.user.discriminator).replace(/\$hastebin/g, hb);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch (e) {
      console.log(e);
    }
  }
  async function guildMemberRemove(guild, member) {
    try {
      let a = await dbEI.getEvent(guild.id, 'guildMemberRemove');
      if (a.event.d === true) {
        let hb = '';
        if (a.event.msg.includes('$hastebin')) {
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
        let finalMessage = a.event.msg.replace(/\$memberId/g, member.user.id).replace(/\$member/g, member.user.username + '#' + member.user.discriminator).replace(/\$hastebin/g, hb);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
      memberLeft(guild, member);
    }
    catch (e) {
      console.log(e);
    }
  }
  async function shameKick(guild, member, auditlog) {
    try {
      let a = await dbEI.getEvent(guild.id, 'shameKick');
      if (a.event.d === true) {
        let entry = auditlog.entries[0];
        let hb = '';
        if (a.event.msg.includes('$hastebin')) {
          let hastebinMessage = 'shameKick event triggered :\n\n';
          hastebinMessage += 'Raw event info :\n\n';
          hastebinMessage += JSON.stringify(member) + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Responsible User\'s Name : ' + entry.user.username + '#' + entry.user.discriminator + '\n';
          hastebinMessage += 'Responsible User\'s Id : ' + entry.user.id + '\n\n';
          hastebinMessage += 'Case : ' + a.modCase + '\n\n';
          hastebinMessage += 'Kicked User\'s Name : ' + member.user.username + '#' + member.user.discriminator + '\n';
          hastebinMessage += 'Kicked User\'s Id : ' + member.user.id + '\n\n';
          hastebinMessage += 'Reason : ' + entry.reason + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += new Date().toISOString();
          hb = await hastebin(configM.config.hastebinServer, hastebinMessage);
        }
        let finalMessage = a.event.msg.replace(/\$kickedId/g, member.user.id).replace(/\$kicked/g, member.user.username + '#' + member.user.discriminator).replace(/\$hastebin/g, hb).replace(/\$responsibleId/g, entry.user.id).replace(/\$responsible/g, entry.user.username + '#' + entry.user.discriminator).replace(/\$reason/g, entry.reason).replace(/\$case/g, a.modCase);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch (e) {
      console.log(e);
    }
  }
  async function pollrLikeKick(guild, member, auditlog) {
    try {
      let a = await dbEI.getEvent(guild.id, 'pollrLikeKick');
      if (a.event.d === true) {
        let entry = auditlog.entries[0];
        let hb = '';
        if (a.event.msg.includes('$hastebin')) {
          let hastebinMessage = 'pollrLikeKick event triggered :\n\n';
          hastebinMessage += 'Raw event info :\n\n';
          hastebinMessage += JSON.stringify(member) + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Responsible User\'s Name : ' + entry.user.username + '#' + entry.user.discriminator + '\n';
          hastebinMessage += 'Responsible User\'s Id : ' + entry.user.id + '\n\n';
          hastebinMessage += 'Case : ' + a.modCase + '\n\n';
          hastebinMessage += 'Kicked User\'s Name : ' + member.user.username + '#' + member.user.discriminator + '\n';
          hastebinMessage += 'Kicked User\'s Id : ' + member.user.id + '\n\n';
          hastebinMessage += 'Reason : ' + entry.reason + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += new Date().toISOString();
          hb = await hastebin(configM.config.hastebinServer, hastebinMessage);
        }
        let finalMessage = a.event.msg.replace(/\$kickedId/g, member.user.id).replace(/\$kicked/g, member.user.username + '#' + member.user.discriminator).replace(/\$hastebin/g, hb).replace(/\$responsibleId/g, entry.user.id).replace(/\$responsible/g, entry.user.username + '#' + entry.user.discriminator).replace(/\$reason/g, entry.reason).replace(/\$case/g, a.modCase);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
        dbEI.incrementModCase(guild.id);
      }
    }
    catch (e) {
      console.log(e);
    }
  }
  async function guildMemberKick(guild, member, auditlog) {
    try {
      shameKick(guild, member, auditlog);
      pollrLikeKick(guild, member, auditlog);
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
      if (entry.actionType === 20 && entry.id !== lastKickAuditLogId[guild.id]) {
        lastKickAuditLogId[guild.id] = entry.id;
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
  bot.on('messageDelete', async (message) => {
    try {
      let a = await dbEI.getEvent(message.channel.guild.id, 'messageDelete');
      if (a.event.d === true) {
        let auditlog = await bot.getGuildAuditLogs(message.channel.guild.id, 1);
        let entry = auditlog.entries[0];
        let hb = '';
        if (a.event.msg.includes('$hastebin')) {
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
        let finalMessage = a.event.msg.replace(/\$messageId/g, message.id).replace(/\$channelId/g, message.channel.id).replace(/\$channel/g, message.channel.name).replace(/\$authorId/g, message.author.id).replace(/\$author/g, message.author.username).replace(/\$hastebin/g, hb);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch (e) {
      console.log(e);
    }
  });
  bot.on('messageReactionAdd', async (message, emoji) => {
    try {
      let a = await dbEI.getEvent(message.channel.guild.id, 'messageReactionAdd');
      if (a.event.d === true) {
        let hb = '';
        if (a.event.msg.includes('$hastebin')) {
          let hastebinMessage = 'messageReactionAdd event triggered :\n\n';
          hastebinMessage += 'Raw event info :\n\n';
          hastebinMessage += JSON.stringify(message) + '\n\n';
          hastebinMessage += JSON.stringify(emoji) + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Message Author\'s Name : ' + message.author.username + '#' + message.author.discriminator + '\n';
          hastebinMessage += 'Message Author\'s Id : ' + message.author.id + '\n\n';
          hastebinMessage += 'Message Channel Name : ' + message.channel.name + '\n';
          hastebinMessage += 'Message Channel Id : ' + message.channel.id + '\n\n';
          hastebinMessage += 'Emoji Name : ' + emoji.name + '\n';
          hastebinMessage += 'Emoji Id : ' + emoji.id + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Content :\n\n';
          hastebinMessage += message.content + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += new Date().toISOString();
          hb = await hastebin(configM.config.hastebinServer, hastebinMessage);
        }
        let finalMessage = a.event.msg.replace(/\$messageId/g, message.id).replace(/\$channelId/g, message.channel.id).replace(/\$channel/g, message.channel.name).replace(/\$emojiId/g, emoji.id).replace(/\$emoji/g, emoji.name).replace(/\$authorId/g, message.author.id).replace(/\$author/g, message.author.username).replace(/\$hastebin/g, hb);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch (e) {
      console.log(e);
    }
  });
  bot.on('messageReactionRemove', async (message, emoji) => {
    try {
      let a = await dbEI.getEvent(message.channel.guild.id, 'messageReactionRemove');
      if (a.event.d === true) {
        let hb = '';
        if (a.event.msg.includes('$hastebin')) {
          let hastebinMessage = 'messageReactionRemove event triggered :\n\n';
          hastebinMessage += 'Raw event info :\n\n';
          hastebinMessage += JSON.stringify(message) + '\n\n';
          hastebinMessage += JSON.stringify(emoji) + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Message Author\'s Name : ' + message.author.username + '#' + message.author.discriminator + '\n';
          hastebinMessage += 'Message Author\'s Id : ' + message.author.id + '\n\n';
          hastebinMessage += 'Message Channel Name : ' + message.channel.name + '\n';
          hastebinMessage += 'Message Channel Id : ' + message.channel.id + '\n\n';
          hastebinMessage += 'Old Emoji Name : ' + emoji.name + '\n';
          hastebinMessage += 'Old Emoji Id : ' + emoji.id + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += 'Content :\n\n';
          hastebinMessage += message.content + '\n\n';
          hastebinMessage += '---\n\n';
          hastebinMessage += new Date().toISOString();
          hb = await hastebin(configM.config.hastebinServer, hastebinMessage);
        }
        let finalMessage = a.event.msg.replace(/\$messageId/g, message.id).replace(/\$channelId/g, message.channel.id).replace(/\$channel/g, message.channel.name).replace(/\$emojiId/g, emoji.id).replace(/\$emoji/g, emoji.name).replace(/\$authorId/g, message.author.id).replace(/\$author/g, message.author.username).replace(/\$hastebin/g, hb);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch (e) {
      console.log(e);
    }
  });
  bot.on('messageUpdate', async (message, oldMessage) => {
    if (message.content === oldMessage.content) return;
    try {
      let a = await dbEI.getEvent(message.channel.guild.id, 'messageUpdate');
      if (a.event.d === true) {
        let hb = '';
        if (a.event.msg.includes('$hastebin')) {
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
        let finalMessage = a.event.msg.replace(/\$messageId/g, message.id).replace(/\$channelId/g, message.channel.id).replace(/\$channel/g, message.channel.name).replace(/\$authorId/g, message.author.id).replace(/\$author/g, message.author.username).replace(/\$hastebin/g, hb);
        bot.createMessage(a.event.c === 'f' ? a.fallbackChannelId : a.event.c, finalMessage);
      }
    }
    catch (e) {
      console.log(e);
    }
  });
};
