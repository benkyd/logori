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
    Discord.bot.on('channelUpdate', async (channel, oldchannel) => {ChannelUpdate(channel, oldchannel)});
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

// Richembed defines
// update: blue #328FA8
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
            timestamp: new Date(timestamp),
            footer: { text: `ID: ${LatestPin.id}` }
        })
    
        embed.colour('#42A832');
        embed.url('https://logori.xyz')
    
        Discord.bot.createMessage(FallbackChannel, {embed: embed.sendable});
    } else 
    {
        let embed = new DiscordEmbed({
            title: `Pin Removed`,
            fields: [
                { name: 'Channel', value: channel.mention, inline: true },
            ],
            timestamp: new Date(timestamp),
            footer: { text: `ID: ${LatestPin.id}` }
        })
    
        embed.colour('#E0532B');
        embed.url('https://logori.xyz')
    
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
                timestamp: new Date(),
                footer: { text: `ID: ${channel.id}` }
            })

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
            
            embed.colour('#328FA8');
            embed.url('https://logori.xyz')

            Discord.bot.createMessage(FallbackChannel, { embed: embed.sendable });
        }

        if (channel.permissionOverwrites != oldchannel.permissionOverwrites)
        {
            channel.permissionOverwrites.forEach(e => console.log(e));

            const oldperm = oldchannel.permissionOverwrites;
            const newperm = channel.permissionOverwrites;

            

        }

    } else if (Type == voice)
    {

    }


}
