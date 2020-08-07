const Logger = require('./logger.js');
const Events = require('./discord-events.js');
const Commands = require('./discord-commands.js');

const fs = require('fs');

const Eris = require('eris');

module.exports.bot;

module.exports.setup = async function()
{
    Logger.info('Setting up discord bot');
   
	let isProduction = process.env.NODE_ENV == 'production';
	let token = isProduction ? process.env.BOT_TOKEN : process.env.BOT_DEV_TOKEN;
    if (!token) {
		if (isProduction && process.env.BOT_DEV_TOKEN) {
			Logger.warn('No production token specified, using dev token as fallback.');
			token = process.env.BOT_DEV_TOKEN;
		}
		else Logger.panic('No *_TOKEN specified in .env file!'); // Not fallbacking to production when explicitly stated in "dev" lol
	}
    this.bot = new Eris(token,
                       {allowedMentions: false, restMode: true});
    
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

        this.bot.editStatus('online', {name: game, type: type});

        // let array = await this.bot.getMessages('346104470901358595', 20)
        // for (message of array)
        // {
        //     console.log(`${message.author.username}#${message.author.discriminator}: ${message.content}`);
        // }

    });

    // settup events
    await Events.setup();
    await Commands.registerCommands();

    this.bot.connect();
}

