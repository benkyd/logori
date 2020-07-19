const Logger = require('./logger.js');
const Events = require('./discordevents.js');
const Commands = require('./discordcommands.js');

const fs = require('fs');

const Eris = require('eris');

module.exports.bot;

module.exports.setup = async function()
{
    Logger.info('Setting up discord bot');
    
    if (!process.env.BOT_TOKEN) Logger.panic('No BOT_TOKEN in .env file!')

    this.bot = new Eris(process.env.BOT_TOKEN, {allowedMentions: false, restMode: true});
    
    this.bot.on('ready', async () => {
        Logger.info(`Discord logged in as ${this.bot.user.username}#${this.bot.user.discriminator}`);

        let typestr = process.env.BOT_GAME_TYPE || 'playing';
        let game = process.env.BOT_GAME || '*';

        let type;
        switch (typestr) {
            case 'playing':   type = 0; break;
            case 'listening': type = 2; break;
            case 'watching':  type = 3; break;
            default:          type = 3; break;
        }

        this.bot.editStatus('online', {name: game, type: type});[]

    });

    // settup events
    await Events.setup();
    await Commands.registerCommands();

    this.bot.connect();
}

