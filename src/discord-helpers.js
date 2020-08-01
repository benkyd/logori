
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

