const level = require('level');
const zlib = require('zlib');

let db = level('./logoriDB'); // Make that path customizable

function put(key, value) {
  return new Promise((resolve, reject) => {
    db.put(key, value, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

function get(key) {
  return new Promise((resolve, reject) => {
    db.get(key, (err, value) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(value);
    });
  });
}

function deflateObj(obj) {
  let text = JSON.stringify(obj);
  let compressed = zlib.deflateSync(text).toString('base64');
  return compressed;
}

function inflateObj(str) {
  let bufferCompressed = new Buffer(str, 'base64');
  let text = zlib.inflateSync(bufferCompressed).toString();
  return JSON.parse(text);
}

/*  const eventsInfoDefault = {
  doChannelCreate: true,
  channelCreateMsg: '',
  doChannelDelete: true,
  channelDeleteMsg: '',
  doChannelPinUpdate: true,
  channelPinUpdateMsg: '',
  doChannelUpdate: true,
  channelUpdateMsg: '',
  doGuildBanAdd: true,
  guildBanAddMsg: '',
  doGuildBanRemove: true,
  guildBanRemoveMsg: '',
  doGuildEmojisUpdate: true,
  guildEmojisUpdateMsg: '',
  doGuildMemberAdd: true,
  guildMemberAddMsg: '',
  doGuildMemberRemove: true,
  guildMemberRemoveMsg: '',
  doGuildMemberUpdate: true,
  guildMemberUpdateMsg: '',
  doGuildRoleCreate: true,
  guildRoleCreateMsg: '',
};  */

exports.initServer = function initServer(id, cId) {
  let obj = {
    modCase: 1,
    fallbackChannelId: cId,
    eventsInfo: {
      channelCreate: {
        d: true,
        msg: 'A $type channel called <#$channelId> has been created by $responsible, $hastebin',
        c: 'f',
      },
      channelDelete: {
        d: true,
        msg: 'A $type channel called $channel has been deleted by $responsible, $hastebin',
        c: 'f',
      },
      channelUpdate: {
        d: true,
        msg: 'The channel $channel has been updated (from name $oldChannel), $hastebin',
        c: 'f',
      },
      shameBan: {
        d: true,
        msg: '***$banned got banned, lol***',
        c: 'f',
      },
      pollrLikeBan: {
        d: true,
        msg: '**Ban**, Case $case\n**User**: $banned ($bannedId)\n**Reason**: $reason\n**Responsible moderator**: $responsible\n**Log**: $hastebin',
        c: 'f',
      },
      guildBanAdd: {
        d: true,
        msg: '$banned has been banned by $responsible, $hastebin',
        c: 'f',
      },
      pollrLikeUnban: {
        d: true,
        msg: '**Unban**, Case $case\n**User**: $unbanned ($unbannedId)\n**Reason**: $reason\n**Responsible moderator**: $responsible\n**Log**: $hastebin',
        c: 'f',
      },
      guildBanRemove: {
        d: true,
        msg: '$unbanned has been unbanned by $responsible, $hastebin',
        c: 'f',
      },
      memberJoin: {
        d: false,
        msg: '$member just joined the server',
        c: 'f',
      },
      guildMemberAdd: {
        d: true,
        msg: '$member joined the server, $hastebin',
        c: 'f',
      },
      memberLeft: {
        d: false,
        msg: '$member just left the server',
        c: 'f',
      },
      guildMemberRemove: {
        d: true,
        msg: '$member left the server, $hastebin',
        c: 'f',
      },
      shameKick: {
        d: true,
        msg: '***$kicked got kicked, lmao***',
        c: 'f',
      },
      pollrLikeKick: {
        d: true,
        msg: '**Kick**, Case $case\n**User**: $kicked ($kickedId)\n**Reason**: $reason\n**Responsible moderator**: $responsible\n**Log**: $hastebin',
        c: 'f',
      },
      guildMemberKick: {
        d: true,
        msg: '$kicked has been kicked by $responsible, $hastebin',
        c: 'f',
      },
      guildMemberUpdate: {
        d: true,
        msg: '$member has been updated by $responsible, $hastebin ```\n$recapitulative```',
        c: 'f',
      },
      messageDelete: {
        d: true,
        msg: 'A message from $author in channel <#$channelId> has been deleted, $hastebin',
        c: 'f',
      },
      messageReactionAdd: {
        d: true,
        msg: 'A reaction with the emote :$emoji: has been added to a message from $author in <#$channelId>',
        c: 'f',
      },
      messageReactionRemove: {
        d: true,
        msg: 'A reaction with the emote :$emoji: has been removed from a message from $author in <#$channelId>',
        c: 'f',
      },
      messageUpdate: {
        d: true,
        msg: 'A message from $author in <#$channelId> has been edited, $hastebin',
        c: 'f',
      },
    },
  };
  return put(id, deflateObj(obj));
};

exports.incrementModCase = async function incrementModCase (id) {
  let obj = inflateObj(await get(id));
  obj.modCase += 1;
  return put(id, deflateObj(obj));
}

exports.isAlreadyInitted = async function isAlreadyInitted (id) {
  try {
    await get(id);
    return true;
  }
  catch(e) {
    return false;
  }
};

exports.debugServer = async function debugServer (id) {
  console.log(inflateObj(await get(id)));
}

exports.getAllServer = async function getAllServer(id) {
  let serverEvents = await get(id);
  return inflateObj(serverEvents);
}

exports.getEvent = async function getEvent(id, eventName) {
  let serverEvents = await get(id);
  let obj = inflateObj(serverEvents);
  return {
    modCase: obj.modCase,
    fallbackChannelId: obj.fallbackChannelId,
    event: obj.eventsInfo[eventName],
  };
};

exports.setFallbackChannel = async function setFallbackChannel(id, cId) {
  let serverEvents = await get(id);
  let obj = inflateObj(serverEvents);
  obj.fallbackChannelId = cId;
  return put(id, deflateObj(obj));
};

exports.setEventMsg = async function setEventMsg(id, eventName, msg) {
  let serverEvents = await get(id);
  let obj = inflateObj(serverEvents);
  obj.eventsInfo[eventName].msg = msg;
  return put(id, deflateObj(obj));
};

exports.setEventChannel = async function setEventChannel(id, eventName, cId) {
  let serverEvents = await get(id);
  let obj = inflateObj(serverEvents);
  obj.eventsInfo[eventName].c = cId;
  return put(id, deflateObj(obj));
};

exports.setEventEnable = async function setEventChannel(id, eventName, state) {
  let serverEvents = await get(id);
  let obj = inflateObj(serverEvents);
  obj.eventsInfo[eventName].d = state;
  return put(id, deflateObj(obj));
};
