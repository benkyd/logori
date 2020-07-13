const Logger = require('./logger.js');

let Commands = {};

module.exports.registerCommands = async function()
{
    Logger.info('Registering commands');
}

module.exports.newMessage = async function(message)
{
    console.log(message.content);
}
