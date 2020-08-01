
module.exports.IsUserAdmin = (member) => member.permission.has('administrator') || member.id == process.env.BOT_OWNER;
module.exports.GetGuildCatatory = (guild, catid) => guild.channels.find(c => c.id == catid);
module.exports.GetGuildRole = (guild, roleid) => guild.roles.find(c => c.id == roleid);
