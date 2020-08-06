const Logger = require('./logger.js');
const Database = require('./database.js');
const Commands = require('./discord-commands.js');

const Discord = require('./discord.js');
const DiscordHelpers = require('./discord-helpers.js');
const DiscordEmbed = require('./discord-embedbuilder.js');

const ADJSCore = require('./ajds-core.js');

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
    Discord.bot.on('guildCreate', async (guild) => {GuildCreate(guild)});
    Discord.bot.on('guildDelete', async (guild) => {GuildDelete(guild)});
    Discord.bot.on('guildEmojisUpdate', async (guild, emojis, oldemojis) => {GuildEmojisUpdate(guild, emojis, oldemojis)});
    Discord.bot.on('guildMemberAdd', async (guild, member) => {GuildMemberAdd(guild, member)});
    Discord.bot.on('guildMemberRemove', async (guild, member) => {GuildMemberRemove(guild, member)});
    Discord.bot.on('guildMemberUpdate', async (guild, member, oldmember) => {}); // TODO(aosync): Check if new nickname is harmful. 
    Discord.bot.on('guildRoleCreate', async (guild, role) => {});
    Discord.bot.on('guildRoleDelete', async (guild, role) => {});
    Discord.bot.on('guildRoleUpdate', async (guild, role, oldrole) => {});
    Discord.bot.on('guildUpdate', async (guild, oldguild) => {});
    Discord.bot.on('inviteCreate', async (guild, invite) => {});
    Discord.bot.on('inviteDelete', async (guild, invite) => {});
    Discord.bot.on('messageCreate', async (message) => {Commands.newMessage(message)});
    Discord.bot.on('messageDelete', async (message) => {MessageDelete(message)});
    Discord.bot.on('messageDeleteBulk', async (messages) => {});
    Discord.bot.on('messageReactionAdd', async (message, emoji) => {});
    Discord.bot.on('messageReactionRemove', async (message, emoji) => {});
    Discord.bot.on('messageReactionRemoveAll', async (message) => {});
    Discord.bot.on('messageReactionRemoveEmoji', async (message, emoji) => {});
    Discord.bot.on('messageUpdate', async (message, oldmessage) => {MessageUpdate(message, oldmessage)});
    Discord.bot.on('presenceUpdate', async (member, oldprescence) => {});
    Discord.bot.on('userUpdate', async (user, olduser) => {}); // TODO(aosync): Check if new username is harmful. Set nickname if yes.
    Discord.bot.on('voiceChannelJoin', async (member, newchannel) => {});
    Discord.bot.on('voiceChannelLeave', async (member, oldchannel) => {});
    Discord.bot.on('voiceChannelSwitch', async (member, newchannel, oldchannel) => {});
    Discord.bot.on('voiceStateUpdate', async (member, oldstate) => {});
    Discord.bot.on('webhooksUpdate', async (data, channelid, guildid) => {});
    Discord.bot.on('warn', async (message, id) => {Warn(message, id)});
    Discord.bot.on('error', async (error, id) => {Error(error, id)});
    Discord.bot.on('disconnect', async (options) => {Disconnect(options)});

    // settup log channel cache
    const guilds = await Database.FetchAllGuilds();

    for (guild of guilds)
    {
        GuildsAndLogChannels[guild.id] = guild.logchannel;
    }
}

// Audit log defines

const GUILD_UPDATE = 1;
const CHANNEL_CREATE = 10;
const CHANNEL_UPDATE = 11;
const CHANNEL_DELETE = 12;
const CHANNEL_OVERWRITE_CREATE = 13;
const CHANNEL_OVERWRITE_UPDATE = 14;
const CHANNEL_OVERWRITE_DELETE = 15;
const MEMBER_KICK = 20;
const MEMBER_PRUNE = 21;
const MEMBER_BAN_ADD = 22;
const MEMBER_BAN_REMOVE = 23;
const MEMBER_UPDATE = 24;
const MEMBER_ROLE_UPDATE = 25;
const MEMBER_MOVE =	26;
const MEMBER_DISCONNECT = 27;
const BOT_ADD =	28;
const ROLE_CREATE =	30;
const ROLE_UPDATE =	31;
const ROLE_DELETE =	32;
const INVITE_CREATE = 40;
const INVITE_UPDATE = 41;
const INVITE_DELETE = 42;
const WEBHOOK_CREATE = 50;
const WEBHOOK_UPDATE = 51;
const WEBHOOK_DELETE = 52;
const EMOJI_CREATE = 60;
const EMOJI_UPDATE = 61;
const EMOJI_DELETE = 62;
const MESSAGE_DELETE = 72;
const MESSAGE_BULK_DELETE =	73;
const MESSAGE_PIN =	74;
const MESSAGE_UNPIN = 75;
const INTEGRATION_CREATE = 80;
const INTEGRATION_UPDATE = 81;
const INTEGRATION_DELETE = 82;

// Handlers / Helpers

// TODO: this should cache properly
async function GetLogChannel(guildID)
{
    // if there's aready a fallback channel - need to add a clause to update
    // this if the guild's log channel is changed during runtime which is likely
    // if (GuildsAndLogChannels[guildID] != -1) return GuildsAndLogChannels[guildID];
    // // if there's no log channel check if the database has been updated
    // if (GuildsAndLogChannels[guildID] == -1)
    // {
    // }

    const guild = await Database.FetchGuild(guildID);
    return guild == -1 ? -1 : guild.logchannel;
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
    const AlreadyGuild = await Database.FetchGuild(guild.id);
    if (AlreadyGuild == -1) 
    {
        Database.NewGuild(guild.id, guild.name, '*', -1, {}, 0);
    } else {
        if (AlreadyGuild.name == guild.name) return;
        Database.UpdateGuildName(guild.id, guild.name);
    }
}

async function GuildDelete(guild)
{
    // TODO: innactive guild tags in the database
}

async function Warn(message, id)
{
    Logger.warn('Discord: ' + message);
}

async function Error(error, id)
{
    Logger.error('Discord: ' + error);
}

async function Disconnect(options)
{
    Logger.error('Logori disconnected');
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

    DiscordHelpers.SendMessageSafe(FallbackChannel, {embed: embed.sendable});

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

    DiscordHelpers.SendMessageSafe(FallbackChannel, {embed: embed.sendable});
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
            colour: ColourConvert('#42A832'),
            url: 'https://logori.xyz',
            timestamp: new Date(timestamp),
            footer: { text: `ID: ${LatestPin.id}` }
        });
    
        DiscordHelpers.SendMessageSafe(FallbackChannel, {embed: embed.sendable});
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
    
        DiscordHelpers.SendMessageSafe(FallbackChannel, {embed: embed.sendable});
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
            
            DiscordHelpers.SendMessageSafe(FallbackChannel, { embed: embed.sendable });
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

                DiscordHelpers.SendMessageSafe(FallbackChannel, {embed: embed.sendable});
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

                DiscordHelpers.SendMessageSafe(FallbackChannel, {embed: embed.sendable});
                return;
            }

            // find the overwrites that have changed, there is no chance of a new overwrite
            // or a deleted one, a diff must be constructed
            // TODO : make an ambigous role overwrite diff

            // gonna skip this for now, need an overwriter method

        }

    } else if (Type == 'Voice')
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
    const LastBanLog = await guild.getAuditLogs(1, undefined, MEMBER_BAN_ADD);
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

    DiscordHelpers.SendMessageSafe(FallbackChannel, { embed: embed.sendable });
}

async function GuildBanRemove(guild, user)
{
    const FallbackChannel = await GetLogChannel(guild.id);
    if (FallbackChannel == -1) return;

    const ModCases = (await Database.FetchGuild(guild.id)).modcases;
    // Doesn't need to be async - if it fails it's not the end of the world
    Database.IncrementGuildModCases(guild.id);

    // 23 is member ban remove
    const LastBanLog = await guild.getAuditLogs(1, undefined, MEMBER_BAN_REMOVE);
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

    DiscordHelpers.SendMessageSafe(FallbackChannel, { embed: embed.sendable });
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
    let AJDSScore = await ADJSCore.ScoreMember(member);

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

    let WarningString = '';

    if (AJDSScore.warnings.length != 0)
    {
        WarningString += '***Warnings:***\n'
        for (warning of AJDSScore.warnings)
        {
            switch (warning.severity)
            {
                default:
                case 0:
                    WarningString += warning.warning + '\n';
                    break;
                case 1:
                    WarningString += '⚠️' + warning.warning + '⚠️\n';
                    break;
                case 2:
                    WarningString += '⚠️' + warning.warning.toUpperCase() + '⚠️\n';
                    break;
                case 3:
                    WarningString += '🚨⚠️❗**' + warning.warning.toUpperCase() + '**❗⚠️🚨\n';
                    break;
            }
        }
    } 

    let HarmfulName = ADJSCore.IsIdentifierHarmful(member.username);
    let HarmfulStr;
    if (HarmfulName) 
    {
        HarmfulStr = '**Username warning: ** This member\'s username is un-pingable\n'

        try {
            await member.edit({
                nick: ADJSCore.NeutralizeHarmfulIdentifier(member.username)
            });
            HarmfulStr += '**Action Taken:** This member\'s username was changed. This will soon be a configurable option, but for now you if you would not like this feature, you can turn it off by removing the manage nicknames permission from logori.'
        } catch (e)
        { }
    }

    embed.field('​', `**Member:** ${member.mention}
    **AJDS Results:**
    *${AJDSScore.literalscore}*
    ${WarningString ? WarningString : ''}\n
    ${HarmfulStr ? HarmfulStr : ''}`);
	

    // embed.field('​', `${member.mention} is ${AddOrdinalSuffix(DiscordHelpers.GetMemberJoinPos(member.id, guild))} to join`);

    DiscordHelpers.SendMessageSafe(FallbackChannel, { embed: embed.sendable });
}

async function GuildMemberRemove(guild, member)
{
    const FallbackChannel = await GetLogChannel(guild.id);
    if (FallbackChannel == -1) return;

    let embed = new DiscordEmbed({
        author: {
            name: `${member.username}#${member.discriminator}`,
            icon_url: member.avatarURL,
            url: 'https://logori.xyz'
        },
        title: 'Member Left',
        colour: ColourConvert('#E0532B'),
        url: 'https://logori.xyz',
        timestamp: new Date(),
        footer: { text: `ID: ${member.id}` }
    });

    embed.field('​', `**Member:** ${member.mention}`);

    DiscordHelpers.SendMessageSafe(FallbackChannel, { embed: embed.sendable });
}

async function MessageDelete(message)
{
    const FallbackChannel = await GetLogChannel(message.channel.guild.id);
    if (FallbackChannel == -1) return;


	// FIXME: Check if audit log entry is recent enough. Because it might cause it to use an entry for a previous action.
	// When this is implemented, we'll just have to assume deleter is author when no recent enough entry is found.

    const LastAuditEntry = (await message.channel.guild.getAuditLogs(1, undefined, MESSAGE_DELETE)).entries[0];    
    const DeletedMessage = LastAuditEntry.channel.messages.random();

    try {
		let authorMention = 'Author not found';
		let author = {
			name: 'Unknown',
			url: 'https://logori.xyz'
		}
		let responsible = LastAuditEntry ? LastAuditEntry.user.mention : 'Message author';
		if (message.author) {
			author.name = message.author.username;
			author.icon_url = message.author.avatarURL;
			authorMention = message.author.mention;
		} else if (DeletedMessage && DeletedMessage.author && DeletedMessage.author.username) {
			/*	author.name = DeletedMessage.author.username;
				author.icon_url = DeletedMessage.author.avatarURL;
				authorMention = DeletedMessage.author.mention;
			*/
			// Left blank because currently inaccurate. When the IMPORTANT comment is achieved, the above lines can be uncommented.
		}

        let embed = new DiscordEmbed({
            author: author,
            title: 'Message Deleted',
            colour: ColourConvert('#E0532B'),
            url: 'https://logori.xyz',
            timestamp: new Date(),
            footer: { text: `ID: ${message.id}` }
        });
    
        embed.field('​', `**Message Owner:** ${authorMention}
        **Responsible Moderator**: ${responsible}
        **Channel:** ${message.channel.mention}
        **Message Content:** ${message.content || 'Message was not cached.'} `);

        DiscordHelpers.SendMessageSafe(FallbackChannel, { embed: embed.sendable });
    } catch (e)
    {
        Logger.warn('The stupid messagedelete function messed up again');
		// It won't anymore :^).
    }
}

async function MessageUpdate(message, oldmessage)
{
    const FallbackChannel = await GetLogChannel(message.channel.guild.id);
    if (FallbackChannel == -1) return;

    if (!message || !oldmessage) return;
    if (message.content == oldmessage.content) return;

    let embed = new DiscordEmbed({
        author: {
            name: `${message.author.username}#${message.author.discriminator}`,
            icon_url: message.author.avatarURL,
            url: 'https://logori.xyz'
        },
        title: 'Message Edited',
        colour: ColourConvert('#328FA8'),
        url: 'https://logori.xyz',
        timestamp: new Date(),
        footer: { text: `ID: ${message.id}` }
    });

    embed.field('​', `**Message Owner:** ${message.author.mention}
    **Old Message:**: ${oldmessage.content}
    **New Message:**: ${message.content}`);

    DiscordHelpers.SendMessageSafe(FallbackChannel, { embed: embed.sendable });
}
