const Eris = require('eris');

module.exports.IsUserAdmin = function (member)
{
    return member.permission.has('administrator') || member.id == process.env.BOT_OWNER;
}
