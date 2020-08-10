const Database = require('./database.js')

module.exports.SetupGuild = async function(id, name, logchannel = -1, )
{

    const GuildSettings = {
        DoUnpingableNickname: false
    };

    Database.NewGuild();
}
