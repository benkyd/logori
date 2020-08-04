const Logger = require('./logger.js');
const Database = require('./database.js');

const Discord = require('./discord.js');
const DiscordHelpers = require('./discord-helpers.js');
const DiscordEmbed = require('./discord-embedbuilder.js');

let Commands = [];

let GuildsAndPrefixs = [];

module.exports.registerCommands = async function()
{
    Logger.info('Registering commands');

    Commands['initserv'] = { command: 'initserv', alias: 'nil', name: 'Initialize Server', desc: 'Initialises a new Guild', callback: InitializeGuild, adminOnly: true };
    Commands['setprefix'] = { command: 'setprefix', alias: 'prefix', name: 'Set Prefix', desc: 'Sets the servers prefix for the guild', callback: SetPrefix, adminOnly: true };
    Commands['setfallbackchannel'] = { command: 'setlogchannel', alias: 'setlogchannel', name: 'Set Log Channel', desc: 'Sets the guild log channel to the current channel', callback: SetLogChannel, adminOnly: true };

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
            Discord.bot.createMessage(message.channel.id, 'The `administrator` privaledge is required to execute that command');
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
    
}

async function SetPrefix(message, args)
{
    if (!args[0])
    {
        Discord.bot.createMessage(message.channel.id, 'You must provide a new prefix');
        return;
    }

    const NewPrefix = args[0];

    await Database.UpdateGuildPrefix(message.guildID, NewPrefix);
    
    // Update cache
    GuildsAndPrefixs[message.guildID] = NewPrefix;

    Discord.bot.createMessage(message.channel.id, `New prefix for guild : \`${NewPrefix}\``)
}

async function SetLogChannel(message, args)
{

}
