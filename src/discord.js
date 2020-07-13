const Logger = require('./logger.js');
const Database = require('./database.js');

const fs = require('fs');

const Eris = require('eris');

let bot;

module.exports.setup = async function()
{
    Logger.info('Setting up discord bot');
    
    if (!process.env.BOT_TOKEN) Logger.panic('No BOT_TOKEN in .env file!')

    bot = new Eris(process.env.BOT_TOKEN, {allowedMentions: false, restMode: true});
    
    bot.on('ready', async () => {
        Logger.info(`Discord logged in as ${bot.user.username}#${bot.user.discriminator}`);

        let typestr = process.env.BOT_GAME_TYPE || 'playing';
        let game = process.env.BOT_GAME || '*';

        let type;
        switch (typestr) {
            case 'playing':   type = 0; break;
            case 'listening': type = 2; break;
            case 'watching':  type = 3; break;
            default:          type = 3; break;
        }

        bot.editStatus('online', {name: game, type: type});

    });

    // settup events

    bot.connect();
}

