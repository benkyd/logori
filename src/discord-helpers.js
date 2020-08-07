const Discord = require('./discord.js');
const Logger = require('./logger.js');


/*
 * Following Snowflake class has been taken from aosync's mo discord library.
 */
const DEPOCH = 1420070400000n;
class Snowflake {
    constructor(sf) {
        this.int = BigInt(sf);
    }
    getTime() {
        return Number((this.int >> 22n) + DEPOCH);
    }
    getInternalWorkerId() {
        return Number((this.int & 0x3E0000n) >> 17n);
    }
    getInternalProcessId() {
        return Number((this.int & 0x1F000n) >> 12n);
    }
    getIncrement() {
        return Number((this.int & 0xFFFn));
    }
}

module.exports.IsMemberAdmin = (member) => member.permission.has('administrator') || member.id == process.env.BOT_OWNER;
module.exports.GetGuildCatatory = (guild, catid) => guild.channels.find(c => c.id == catid);
module.exports.GetGuildRole = (guild, roleid) => guild.roles.find(c => c.id == roleid);
module.exports.GetMemberJoinPos = (memberid, guild) =>
{
    // https://stackoverflow.com/questions/54331654/how-do-you-find-your-join-position-in-a-server
    let arr = guild.members.baseObject; // Create an array with every member
    arr.sort((a, b) => a.joinedAt - b.joinedAt); // Sort them by join date

    for (let i = 0; i < arr.length; i++) { // Loop though every element
      if (arr[i].id == memberid) return i; // When you find the user, return it's position
    }
}
module.exports.SendMessageSafe = async (channelid, message) =>
{
    // TODO: make this an actual check instead of a guess & catch lol
    
    try {
        Discord.bot.createMessage(channelid, message);
    } catch (e)
    {
        Logger.warn(`Unable to send message in channel ${channelid}`);
    }
}
module.exports.GetRecentEnoughAuditLogEntry = async (guildid, before, mask, maxAgeMs) => {
	if (!maxAgeMs) maxAgeMs = 15000; // Don't worry about that value, discord is bad at knowing time.

	const LastAuditEntry = (await Discord.bot.getGuildAuditLogs(guildid, 1, null, mask)).entries[0];
	if (!LastAuditEntry) return null;

	let entryCreationTime = (new Snowflake(LastAuditEntry.id)).getTime();
	let timeOfNow = (new Date()).getTime();

	return timeOfNow - maxAgeMs <= entryCreationTime ? LastAuditEntry : null;
}
