const Logger = require('./logger.js');

const Sequelize = require('sequelize');

let Database;

let Guild;

module.exports.setup = async function()
{
    Logger.info('Setting up database');

    if (process.env.NODE_ENV == "production")
    {
        Logger.database('Setting up production databse');
        Database = new Sequelize(`mariadb://${process.env.DB_LOCATION}:3306/${process.env.DB_DATABASE}?user=${process.env.DB_USER}&password=${process.env.DB_PASS}`, {
            dialect: 'mariadb',
            logging: Logger.database
        });
    } else {
        Logger.database('Setting up development databse');
        Database = new Sequelize({
            dialect: 'sqlite',
            storage: process.env.DB_DEV_LOCATION,
            logging: Logger.database
        });
    }



    Guild = Database.define('guild', {
        id: {
            type: Sequelize.STRING,
            primaryKey: true,
            unique: true
        },
        name: Sequelize.STRING,
        prefix: Sequelize.STRING,
        logchannel: Sequelize.STRING,
        guildsettings: Sequelize.JSON,
        logsettings: Sequelize.JSON, // JSON / Array
        modcases: Sequelize.INTEGER
    }, {
        tableName: 'guild'
    });

    try 
    {
        await Database.authenticate();
        await Database.sync();
        Logger.info('Database connection has been established successfully.');
    } catch (error) {
        Logger.panic(`Unable to connect to the database: ${error}`);
    }

}

module.exports.NewGuild = async function(id, name, prefix, logchannel, guildsettings, logsettings, modcases) 
{
    try {
        let user = await Guild.create({
            id: id,
            name: name,
            prefix: prefix,
            logchannel: logchannel, // -1 if not set
            guildsettings: guildsettings,
            logsettings: logsettings,
            modcases: modcases
        });
        return user;
    } catch (e) {
        Logger.error(`An error occured while inserting guild ${id} : ${e}`);
        return -1;
    }
}


module.exports.FetchAllGuilds = async function()
{
    try {
        let guild = await Guild.findAll();
        return guild == null ? -1 : guild;
    } catch (e) {
        Logger.error(`An error occured while fetching guilds : ${e}`);
        return -1;
    }
}

module.exports.FetchGuild = async function(id)
{
    try {
        let guild = await Guild.findOne({where: {id: id}});
        return guild == null ? -1 : guild;
    } catch (e) {
        Logger.error(`An error occured while fetching guild ${id} : ${e}`);
        return -1;
    }
}

module.exports.UpdateGuildName = async function(id, name)
{
    try {
        await Guild.update({name: name}, {where: {id: id}});
    } catch (e) {

    }
}

module.exports.UpdateGuildPrefix = async function(id, prefix)
{
    try {
        await Guild.update({prefix: prefix}, {where: {id: id}});
        return 1;
    } catch (e) {
        Logger.error(`An error occured while updating guild id ${id} : ${e}`);
        return -1;
    }
}

module.exports.UpdateGuildLogChannel = async function(id, channel)
{
    try {
        await Guild.update({logchannel: channel}, {where: {id: id}});
        return 1;
    } catch (e) {
        Logger.error(`An error occured while updating guild id ${id} : ${e}`);
        return -1;
    }
}

module.exports.UpdateGuildLogSettings = async function(id, settings)
{
    try {
        await Guild.update({logsettings: settings}, {where: {id: id}});
        return 1;
    } catch (e) {
        Logger.error(`An error occured while updating guild id ${id} : ${e}`);
        return -1;
    }
}

module.exports.IncrementGuildModCases = async function(id)
{
    try {
        await Guild.update({modcases: Sequelize.literal('modcases + 1')}, {where: {id: id}});
        return 1;
    } catch (e) {
        Logger.error(`An error occured while updating guild id ${id} : ${e}`);
        return -1;
    }
}

module.exports.DeleteGuild = async function(id)
{
    try {
        await Guild.destroy({where: {id: id}});
        return 1;
    } catch (e) {
        Logger.error(`An error occured while deleting guild id ${id} : ${e}`);
        return -1;
    }
}
