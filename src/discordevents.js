const Logger = require('./logger.js');
const Discord = require('./discord.js');
const Commands = require('./discordcommands.js');

module.exports.setup = async function()
{
    Logger.info('Setting up discord listeners');

    Discord.bot.on('channelCreate', async (channel) => {});
    Discord.bot.on('channelDelete', async (channel) => {});
    Discord.bot.on('channelPinUpdate', async (channel, timestamp, oldtimestamp) => {});
    Discord.bot.on('channelUpdate', async (channel, oldchannel) => {});
    Discord.bot.on('guildBanAdd', async (guild, user) => {});
    Discord.bot.on('guildBanRemove', async (guild, user) => {});
    Discord.bot.on('guildCreate', async (guild) => {});
    Discord.bot.on('guildDelete', async (guild) => {});
    Discord.bot.on('guildEmojisUpdate', async (guild, emojis, oldemojis) => {});
    Discord.bot.on('guildMemberAdd', async (guild, member) => {});
    Discord.bot.on('guildMemberRemove', async (guild, member) => {});
    Discord.bot.on('guildMemberUpdate', async (guild, member, oldmember) => {});
    Discord.bot.on('guildRoleCreate', async (guild, role) => {});
    Discord.bot.on('guildRoleDelete', async (guild, role) => {});
    Discord.bot.on('guildRoleUpdate', async (guild, role, oldrole) => {});
    Discord.bot.on('guildUpdate', async (guild, oldguild) => {});
    Discord.bot.on('inviteCreate', async (guild, invite) => {});
    Discord.bot.on('inviteDelete', async (guild, invite) => {});
    Discord.bot.on('messageCreate', async (message) => Commands.newMessage(message));
    Discord.bot.on('messageDelete', async (message) => {});
    Discord.bot.on('messageDeleteBulk', async (messages) => {});
    Discord.bot.on('messageReactionAdd', async (message, emoji) => {});
    Discord.bot.on('messageReactionRemove', async (message, emoji) => {});
    Discord.bot.on('messageReactionRemoveAll', async (message) => {});
    Discord.bot.on('messageReactionRemoveEmoji', async (message, emoji) => {});
    Discord.bot.on('messageUpdate', async (message, oldmessage) => {});
    Discord.bot.on('presenceUpdate', async (member, oldprescence) => {});
    Discord.bot.on('userUpdate', async (user, olduser) => {});
    Discord.bot.on('voiceChannelJoin', async (member, newchannel) => {});
    Discord.bot.on('voiceChannelLeave', async (member, oldchannel) => {});
    Discord.bot.on('voiceChannelSwitch', async (member, newchannel, oldchannel) => {});
    Discord.bot.on('voiceStateUpdate', async (member, oldstate) => {});
    Discord.bot.on('webhooksUpdate', async (data, channelid, guildid) => {});
    Discord.bot.on('warn', async (message, id) => {});
    Discord.bot.on('error', async (error, id) => {});
    Discord.bot.on('disconnect', async (options) => {});
}

// Handlers


