const Logger = require('./logger.js');
const Database = require('./database.js');
const Commands = require('./discord-commands.js');

const Discord = require('./discord.js');
const DiscordHelpers = require('./discord-helpers.js');
const DiscordEmbed = require('./discord-embedbuilder.js');

const Eris = require('eris');

let GuildsAndLogChannels = [];

module.exports.setup = async function()
{
    Logger.info('Setting up discord listeners');

    Discord.bot.on('channelCreate', async (channel) => {ChannelCreate(channel)});
    Discord.bot.on('channelDelete', async (channel) => {ChannelDelete(channel)});
    Discord.bot.on('channelPinUpdate', async (channel, timestamp, oldtimestamp) => {ChannelPinUpdate(channel, timestamp, oldtimestamp)});
    Discord.bot.on('channelUpdate', async (channel, oldchannel) => {ChannelUpdate(channel, oldchannel)});
    Discord.bot.on('guildBanAdd', async (guild, user) => {GuildBanAdd(guild, user)});
    Discord.bot.on('guildBanRemove', async (guild, user) => {GuildBanRemove(guild, user)});
    Discord.bot.on('guildCreate', async (guild) => {});
    Discord.bot.on('guildDelete', async (guild) => {});
    Discord.bot.on('guildEmojisUpdate', async (guild, emojis, oldemojis) => {GuildEmojisUpdate(guild, emojis, oldemojis)});
    Discord.bot.on('guildMemberAdd', async (guild, member) => {GuildMemberAdd(guild, member)});
    Discord.bot.on('guildMemberRemove', async (guild, member) => {GuildMemberRemove(guild, member)});
    Discord.bot.on('guildMemberUpdate', async (guild, member, oldmember) => {});
    Discord.bot.on('guildRoleCreate', async (guild, role) => {});
    Discord.bot.on('guildRoleDelete', async (guild, role) => {});
    Discord.bot.on('guildRoleUpdate', async (guild, role, oldrole) => {});
    Discord.bot.on('guildUpdate', async (guild, oldguild) => {});
    Discord.bot.on('inviteCreate', async (guild, invite) => {});
    Discord.bot.on('inviteDelete', async (guild, invite) => {});
    Discord.bot.on('messageCreate', async (message) => {Commands.newMessage(message)});
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

// Handlers / Helpers

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

function BuildObjDiff(before, after) {
    let ret = [];
    let doneKeys = [];
    Object.keys(after).forEach(key => {
        let one = typeof (before[key]) === 'object' ? JSON.stringify(before[key]) : before[key];
        let two = typeof (after[key]) === 'object' ? JSON.stringify(after[key]) : after[key];
        ret[one] = two;
        doneKeys.push(key);
    });
    Object.keys(before).forEach(key => {
        if (!doneKeys.includes(key)) {
            let one = typeof (before[key]) === 'object' ? JSON.stringify(before[key]) : before[key];
            let two = typeof (after[key]) === 'object' ? JSON.stringify(after[key]) : after[key];
            ret[one] = two;
        }
    });
    return ret;
}

function AddOrdinalSuffix(i) {
    let j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}

function ColourConvert(colour)
{
    let base = 10;
    if (typeof colour === 'string' && colour.startsWith('#')) {
        colour = colour.replace('#', '');
        base = 16;
    }
    colour = parseInt(colour, base);
    if (colour < 0 || colour > 0xFFFFFF) throw new Error('Colour must be a valid HEX-colour for HTML or be an integer within 0 - 16777215');
    else if (colour && isNaN(colour)) throw new Error('Could not convert colour to number.');
    return colour;
}

// Non-logable events

async function GuildCreate(guild)
{
    
}

async function GuildDelete(guild)
{

}

async function Warn(message, id)
{

}

async function Error(error, id)
{

}

async function Disconnect(options)
{

}

// Richembed defines
// update: blue #328FA8
// delete / leave: red #E0532B
// create / join: green #42A832
// everything else: yellow #F0F03A
// customisable features in the future?

// would do website logging before return if fallback
// channel is undefined

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
        colour: ColourConvert('#42A832'),
        url: 'https://logori.xyz',
        timestamp: new Date(),
        footer: { text: `ID: ${channel.id}` }
    });

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
        colour: ColourConvert('#E0532B'),
        url: 'https://logori.xyz',
        timestamp: new Date(),
        footer: { text: `ID: ${channel.id}` }
    });

    Discord.bot.createMessage(FallbackChannel, {embed: embed.sendable});
}

async function ChannelPinUpdate(channel, timestamp, oldtimestamp)
{
    if (!channel.guild) return;
    const FallbackChannel = await GetLogChannel(channel.guild.id)
    if (FallbackChannel == -1) return;

    const LatestPin = (await channel.getPins())[0] || { author: { mention: "Invalid User" } };

    // if timestamp is greater than the old timestamp
    // then the pin is new, otherwise, the pin is removed
    if (timestamp > oldtimestamp)
    {
        let embed = new DiscordEmbed({
            title: `Pin Created`,
            fields: [
                { name: 'Channel', value: channel.mention, inline: true },
                { name: 'Author', value: LatestPin.author.mention, inline: true },
                { name: 'Content', value: LatestPin.content ? LatestPin.content : "Blank Message", inline: false }
            ],
            colour: '#42A832',
            url: 'https://logori.xyz',
            timestamp: new Date(timestamp),
            footer: { text: `ID: ${LatestPin.id}` }
        });
    
        Discord.bot.createMessage(FallbackChannel, {embed: embed.sendable});
    } else 
    {
        let embed = new DiscordEmbed({
            title: `Pin Removed`,
            fields: [
                { name: 'Channel', value: channel.mention, inline: true },
            ],
            colour: ColourConvert('#E0532B'),
            url: 'https://logori.xyz',
            timestamp: new Date(timestamp),
            footer: { text: `ID: ${LatestPin.id}` }
        });
    
        Discord.bot.createMessage(FallbackChannel, {embed: embed.sendable});
    }
}

async function ChannelUpdate(channel, oldchannel)
{
    if (!channel.guild) return;
    const FallbackChannel = await GetLogChannel(channel.guild.id)
    if (FallbackChannel == -1) return;

    // channels can only be updated one section at a time
    // that means channel name / topic /nsfw / limiter 
    // OR orverwrites, never both

    const Type = channel.type == 0 ? 'Text' : 'Voice';

    if (Type == 'Text')
    {
        if (channel.name != oldchannel.name
         || channel.nsfw != oldchannel.nsfw
         || channel.topic != oldchannel.topic)
        {
            let embed = new DiscordEmbed({
                title: `Text Channel ${oldchannel.name} Updated`,
                colour: ColourConvert('#328FA8'),
                url: 'https://logori.xyz',
                timestamp: new Date(),
                footer: { text: `ID: ${channel.id}` }
            });

            // these include zws characters
            embed.field('​', '**Before**', true); 
            embed.field('​', '**After**', true); 
            embed.field('​', '​', true);

            if (channel.name != oldchannel.name)
            {
                embed.field('Name:', oldchannel.name, true); 
                embed.field('Name:', channel.name, true); 
                embed.field('​', '​', true);
            }
            if (channel.nsfw != oldchannel.nsfw)
            {
                embed.field('nsfw:', oldchannel.nsfw, true); 
                embed.field('nsfw:', channel.nsfw, true); 
                embed.field('​', '​', true);
            }
            if (channel.topic != oldchannel.topic)
            {
                embed.field('Topic:', oldchannel.topic ? oldchannel.topic : "No topic", true); 
                embed.field('Topic:', channel.topic ? channel.topic : "No topic", true);
                embed.field('​', '​', true);
            }
            
            embed.field('Channel', channel.mention, true);
            
            Discord.bot.createMessage(FallbackChannel, { embed: embed.sendable });
        }

        if (channel.permissionOverwrites != oldchannel.permissionOverwrites)
        {
            const oldperm = oldchannel.permissionOverwrites;
            const newperm = channel.permissionOverwrites;

            delete oldperm.baseObject;
            delete newperm.baseObject
            delete oldperm.limit
            delete newperm.limit
            
            // oldperm and newperms are collections which
            // extend map which is a pretty generic unordered
            // map (in js basically an array lmao)

            // Role overwrite added
            for (perm of newperm)
            {
                const RoleID = perm[0];
                // role overwrite already exists
                if (oldperm.get(RoleID)) continue;
                const Role = DiscordHelpers.GetGuildRole(channel.guild, RoleID);

                let embed = new DiscordEmbed({
                    title: 'Channel Overwrite Created',
                    fields: [
                        { name: 'Channel', value: channel.mention, inline: true },
                        { name: 'Role Overwrite', value: Role.name, inline: true },
                    ],
                    colour: ColourConvert('#42A832'),
                    url: 'https://logori.xyz',
                    timestamp: new Date(),
                    footer: { text: `ID: ${channel.id}` }
                });

                Discord.bot.createMessage(FallbackChannel, {embed: embed.sendable});
                return;
            }
            // Role overwrite removed
            for (perm of oldperm)
            {
                const RoleID = perm[0];
                // role overwrite already exists
                if (newperm.get(RoleID)) continue;
                const Role = DiscordHelpers.GetGuildRole(channel.guild, RoleID);
                
                let embed = new DiscordEmbed({
                    title: 'Channel Overwrite Removed',
                    fields: [
                        { name: 'Channel', value: channel.mention, inline: true },
                        { name: 'Role Overwrite', value: Role.name, inline: true },
                    ],
                    colour: ColourConvert('#E0532B'),
                    url: 'https://logori.xyz',
                    timestamp: new Date(),
                    footer: { text: `ID: ${channel.id}` }
                });

                Discord.bot.createMessage(FallbackChannel, {embed: embed.sendable});
                return;
            }

            // find the overwrites that have changed, there is no chance of a new overwrite
            // or a deleted one, a diff must be constructed
            // TODO : make an ambigous role overwrite diff

            // gonna skip this for now, need an overwriter method

        }

    } else if (Type == voice)
    {

    }
}

async function GuildBanAdd(guild, user)
{
    const FallbackChannel = await GetLogChannel(guild.id);
    if (FallbackChannel == -1) return;

    const ModCases = (await Database.FetchGuild(guild.id)).modcases;
    // Doesn't need to be async - if it fails it's not the end of the world
    Database.IncrementGuildModCases(guild.id);

    // 22 is member ban add
    const LastBanLog = await guild.getAuditLogs(1, undefined, 22);
    const Ban = await guild.getBan(user.id);

    const BanReason = Ban.reason ? Ban.reason : 'No Reason Given';
    const Banner = await Discord.bot.getRESTUser(LastBanLog.users[0].id);

    let embed = new DiscordEmbed({
        author: {
            name: `${user.username}#${user.discriminator}`,
            icon_url: user.avatarURL,
            url: 'https://logori.xyz'
        },
        title: `${user.username}#${user.discriminator} Was Banned`,
        description: `Mod Case: ${ModCases}`,
        colour: ColourConvert('#F0F03A'),
        url: 'https://logori.xyz',
        timestamp: new Date(),
        footer: { text: `ID: ${user.id}` }
    });

    embed.field('​', `**Name**: ${user.mention}
    **Responsible Moderator**: ${Banner.mention}
    **Reason**: ${BanReason}`, false);

    Discord.bot.createMessage(FallbackChannel, { embed: embed.sendable });
}

async function GuildBanRemove(guild, user)
{
    const FallbackChannel = await GetLogChannel(guild.id);
    if (FallbackChannel == -1) return;

    const ModCases = (await Database.FetchGuild(guild.id)).modcases;
    // Doesn't need to be async - if it fails it's not the end of the world
    Database.IncrementGuildModCases(guild.id);

    // 23 is member ban remove
    const LastBanLog = await guild.getAuditLogs(1, undefined, 23);
    const Banner = await Discord.bot.getRESTUser(LastBanLog.users[0].id);

    let embed = new DiscordEmbed({
        author: {
            name: `${user.username}#${user.discriminator}`,
            icon_url: user.avatarURL,
            url: 'https://logori.xyz'
        },
        title: `${user.username}#${user.discriminator} Was UnBanned`,
        description: `Mod Case: ${ModCases}`,
        colour: ColourConvert('#F0F03A'),
        url: 'https://logori.xyz',
        timestamp: new Date(),
        footer: { text: `ID: ${user.id}` }
    });

    embed.field('​', `**Name**: ${user.mention}
    **Responsible Moderator**: ${Banner.mention}`, false);

    Discord.bot.createMessage(FallbackChannel, { embed: embed.sendable });
}

async function GuildEmojisUpdate(guild, emojis, oldemojis)
{

}

async function GuildMemberAdd(guild, member)
{
    // This function implements AJDS (Anti-James-Defense-System)
    // which uses user heuristics to determine a members risk to
    // a discord server, and with a high enough risk factor, notify
    // the appropriate moderators

    // Part of the log will include the risks of the member

    const FallbackChannel = await GetLogChannel(guild.id);
    if (FallbackChannel == -1) return;

    // AJDS warnings 
    let MemberWarnings = [];
    let MemberScore;

    // TODO: Get proper join position
    let embed = new DiscordEmbed({
        author: {
            name: `${member.username}#${member.discriminator}`,
            icon_url: member.avatarURL,
            url: 'https://logori.xyz'
        },
        title: 'Member Joined',
        colour: ColourConvert('#42A832'),
        url: 'https://logori.xyz',
        timestamp: new Date(),
        footer: { text: `ID: ${member.id}` }
    });

    // embed.field('​', `${member.mention} is ${AddOrdinalSuffix(DiscordHelpers.GetMemberJoinPos(member.id, guild))} to join`);

    Discord.bot.createMessage(FallbackChannel, { embed: embed.sendable });
}

async function GuildMemberRemove(guild, member)
{

}
