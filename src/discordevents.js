const Logger = require('./logger.js');
const Database = require('./database.js');
const Commands = require('./discordcommands.js');

const Discord = require('./discord.js');
const DiscordHelpers = require('./discordhelpers.js');
const DiscordEmbed = require('./discordembedbuilder.js');

const Eris = require('eris');


let GuildsAndLogChannels = [];

module.exports.setup = async function()
{
    Logger.info('Setting up discord listeners');

    Discord.bot.on('channelCreate', async (channel) => {ChannelCreate(channel)});
    Discord.bot.on('channelDelete', async (channel) => {ChannelDelete(channel)});
    Discord.bot.on('channelPinUpdate', async (channel, timestamp, oldtimestamp) => {ChannelPinUpdate(channel, timestamp, oldtimestamp)});
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

    // settup log channel cache
    const guilds = await Database.FetchAllGuilds();

    for (guild of guilds)
    {
        GuildsAndLogChannels[guild.id] = guild.logchannel;
    }
}

// Handlers

async function GetLogChannel(guildID)
{
    // if there's aready a fallback channel - need to add a clause to update
    // this if the guild's log channel is changed during runtime which is likely
    if (GuildsAndLogChannels[guildID] != -1) return GuildsAndLogChannels[guildID];
    // if there's no log channel check if the database has been updated
    if (GuildsAndLogChannels[guildID] == -1)
    {
        const guild = await Database.FetchGuild(guildID);
        return guild == -1 ? -1 : guild.logchannel;
    }
}

// Richembed defines
// update: blue #328fA8
// delete / leave: red #E0532B
// create / join: green #42A832
// everything else: yellow #A84C32
// customisable features in the future?

async function ChannelCreate(channel)
{
    if (!channel.guild) return;
    const FallbackChannel = await GetLogChannel(channel.guild.id)
    if (FallbackChannel == -1) return;

    const Type = channel.type == 0 ? 'Text' : 'Voice';

    let embed = new DiscordEmbed({
        title: `${Type} Channel Created`,
        fields: [
            { name: 'Name', value: channel.mention, inline: true },
            { name: 'Parent Catagory', value: DiscordHelpers.GetGuildCatatory(channel.guild, channel.parentID).name, inline: true }
        ],
        timestamp: new Date(),
        footer: { text: `ID: ${channel.id}` }
    })

    embed.colour('#42A832');
    embed.url('https://logori.xyz')

    Discord.bot.createMessage(FallbackChannel, {embed: embed.sendable});

}

async function ChannelDelete(channel)
{
    if (!channel.guild) return;
    const FallbackChannel = await GetLogChannel(channel.guild.id)
    if (FallbackChannel == -1) return;

    const Type = channel.type == 0 ? 'Text' : 'Voice';

    let embed = new DiscordEmbed({
        title: `${Type} Channel Deleted`,
        fields: [
            { name: 'Name', value: channel.name, inline: true },
            { name: 'Parent Catagory', value: DiscordHelpers.GetGuildCatatory(channel.guild, channel.parentID).name, inline: true }
        ],
        timestamp: new Date(),
        footer: { text: `ID: ${channel.id}` }
    })

    embed.colour('#E0532B');
    embed.url('https://logori.xyz')

    Discord.bot.createMessage(FallbackChannel, {embed: embed.sendable});
}

async function ChannelPinUpdate(channel, timestamp, oldtimestamp)
{
    if (!channel.guild) return;
    const FallbackChannel = await GetLogChannel(channel.guild.id)
    if (FallbackChannel == -1) return;

    let pins = await channel.getPins();

    console.log(pins);

}
