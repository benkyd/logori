const Logger = require('./logger.js');
const Database = require('./database.js');
const Discord = require('./discord.js');

const AJDS = require('./ajds-core.js')

require('dotenv').config()

module.exports.main = async function()
{
    Logger.SetLevel(Logger.VERBOSE_LOGS);
    Logger.init();
    Logger.welcome();

    if (process.env.NODE_ENV == "production")
    {
        Logger.info('Starting in production mode');
    } else {
        Logger.debug('Starting in development mode');
    }

    await Database.setup();

    await Discord.setup();

    Logger.ready();
}
