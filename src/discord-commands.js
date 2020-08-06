const Logger = require('./logger.js');
const Database = require('./database.js');

const Discord = require('./discord.js');
const DiscordHelpers = require('./discord-helpers.js');
const DiscordEmbed = require('./discord-embedbuilder.js');

const AJDSCore = require('./ajds-core.js');

let Commands = [];

let GuildsAndPrefixs = [];

module.exports.registerCommands = async function()
{
    Logger.info('Registering commands');

    Commands['initserv'] = { command: 'initserv', alias: 'nil', name: 'Initialize Server', desc: 'Initialises a new Guild', callback: InitializeGuild, adminOnly: true };
	Commands['fixbadnick'] = { command: 'fixbadnick', alias: 'fixnick', name: 'Fix User Nickname', desc: 'Makes someone\'s nickname decent & pingable', callback: NeutralizeBadNickname, adminOnly: true};
    Commands['setprefix'] = { command: 'setprefix', alias: 'prefix', name: 'Set Prefix', desc: 'Sets the servers prefix for the guild', callback: SetPrefix, adminOnly: true };
    Commands['setfallbackchannel'] = { command: 'setlogchannel', alias: 'setlogchannel', name: 'Set Log Channel', desc: 'Sets the guild log channel to the current channel', callback: SetLogChannel, adminOnly: true };
    Commands['me'] = { command: 'me', alias: 'nil', name: 'Me', desc: 'Returns the users profile on the logori site', callback: MeCommand, adminOnly: false};

    // create a cache of prefix's so that the database doesn't have to be 
    // queried every single time, new guilds should also add themselve's
    // and shit like that

    const guilds = await Database.FetchAllGuilds();

    for (guild of guilds)
    {
        GuildsAndPrefixs[guild.id] = guild.prefix;
    }
}

module.exports.newMessage = async function(message)
{
    // dont respond to bots lol
    if (message.author.bot) return;

    // If there is no guild in the prefix cache
    if (!GuildsAndPrefixs[message.guildID])
    {
        let res = await Database.FetchGuild(message.guildID);
        if (res == -1) 
        {
            let GuildName = '';
            try {
                GuildName = (await Discord.bot.getRESTGuild(message.guildID)).name;
            } catch (e) {
                GuildName = 'not defined';
            }
            Database.NewGuild(message.guildID, GuildName, '*', -1, {}, 0);
            GuildsAndPrefixs[message.guildID] = '*'
        } else 
        {
            GuildsAndPrefixs[message.guildID] = '*'
        }
    }

    const msg = message.content.split(' ');

    // does the message start with the prefix
    if (!msg[0].startsWith(GuildsAndPrefixs[message.guildID])) return;

    // splits the command from the prefix
    const command = msg[0].split(GuildsAndPrefixs[message.guildID])[1].toLowerCase();

    // splits the args from the command
    const args = msg.slice(1, msg.length);


    const CallCommand = (command) => {
        // check if admin is required
        if (command.adminOnly)
        {
            if (DiscordHelpers.IsMemberAdmin(message.member))
            {
                command.callback(message, args);
                return;
            }
            DiscordHelpers.SendMessageSafe(message.channel.id, 'The `administrator` privaledge is required to execute that command');
            return;
        }
        command.callback(message, args);
    };


    // command found in array
    if (Commands[command])
    {
        CallCommand(Commands[command]);
        return;
    }

    // checking alias'
    // TODO: make this more efficient
    // not really needed though as there
    // will be AT MOST 20 commands

    for (cmd in Commands)
    {
        if (Commands[cmd].alias == 'nil') continue;
        if (Commands[cmd].alias == command) 
        {
            CallCommand(Commands[cmd]);
            break;
        }
    }

}

async function InitializeGuild(message, args)
{
    // Outlines private policy etc
    const AlreadyGuild = await Database.FetchGuild(message.guildID);
    const guild = await Discord.bot.getRESTGuild(message.guildID);
    if (AlreadyGuild == -1) 
    {
        Database.NewGuild(guild.id, guild.name, '*', message.channel.id, {}, 0);
    } else {
        if (AlreadyGuild.name != guild.name)
        {
            Database.UpdateGuildName(guild.id, message.guild.name);
        }
        Database.UpdateGuildLogChannel(guild.id, message.channel.id);
    }

    DiscordHelpers.SendMessageSafe(message.channel.id, 'Server successfully initialized, the fallback events channel has been set to this channel, you can change this at any time with *setfallbackchannel');
    DiscordHelpers.SendMessageSafe(message.channel.id, 'By using Logori 2.0, You agree to the private policy clearly outlined at https://logori.xyz/privatepolicy and it is your responsibility as guild administrators to inform members of data collection - as this is a logging bot');

}

async function SetPrefix(message, args)
{
    if (!args[0])
    {
        DiscordHelpers.SendMessageSafe(message.channel.id, 'You must provide a new prefix');
        return;
    }

    const NewPrefix = args[0];

    await Database.UpdateGuildPrefix(message.guildID, NewPrefix);
    
    // Update cache
    GuildsAndPrefixs[message.guildID] = NewPrefix;

    DiscordHelpers.SendMessageSafe(message.channel.id, `New prefix for guild : \`${NewPrefix}\``);
}

async function SetLogChannel(message, args)
{
    const AlreadyGuild = await Database.FetchGuild(message.guildID);
    const guild = await Discord.bot.getRESTGuild(message.guildID);
    if (AlreadyGuild == -1) 
    {
        Database.NewGuild(guild.id, guild.name, '*', message.channel.id, {}, 0);
    } else {
        if (AlreadyGuild.name != guild.name)
        {
            Database.UpdateGuildName(guild.id, message.guild.name);
        }
        Database.UpdateGuildLogChannel(guild.id, message.channel.id);
    }

    DiscordHelpers.SendMessageSafe(message.channel.id, 'Logging fallback channel set to this channel');
}

async function MeCommand(message, args)
{
    DiscordHelpers.SendMessageSafe(message.channel.id, `All of your data can be accessed here: https://logori.xyz/api/v1/user/${message.author.id}`);
}

async function NeutralizeBadNickname(message)
{	
	if (message.mentions.length < 1)
	{	
		DiscordHelpers.SendMessageSafe(message.channel.id, 'You must provide a user');
		return;
	}

	let member = message.channel.guild.members.find(m => m.user.id === message.mentions[0].id);
	let ident = member.nick && member.nick !== '' ? member.nick : member.username;
	try 
	{
		await member.edit({
			nick: AJDSCore.NeutralizeHarmfulIdentifier(ident)
        });
        
        DiscordHelpers.SendMessageSafe(message.channel.id, '`1` Nickname successfully updated');
	}
    catch (e) {}
}
