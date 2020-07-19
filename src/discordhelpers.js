
module.exports.IsUserAdmin = (member) => member.permission.has('administrator') || member.id == process.env.BOT_OWNER;
module.exports.GetGuildCatatory = (guild, catid) => guild.channels.find(c => c.id == catid);
