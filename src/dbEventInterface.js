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
    fallbackChannelId: cId,
    eventsInfo: {
      shameBan: {
        d: true,
        msg: '',
        c: 'f',
      },
      pollrLikeBan: {
        d: true,
        msg: '',
        c: 'f',
      },
      pollrLikeUnban: {
        d: true,
        msg: '',
        c: 'f',
      },
      memberJoin: {
        d: false,
        msg: '',
        c: 'f',
      },
      guildMemberAdd: {
        d: true,
        msg: '',
        c: 'f',
      },
      memberLeft: {
        d: false,
        msg: '',
        c: 'f',
      },
      guildMemberRemove: {
        d: true,
        msg: '',
        c: 'f',
      },
      shameKick: {
        d: true,
        msg: '',
        c: 'f',
      },
      pollrLikeKick: {
        d: true,
        msg: '',
        c: 'f',
      },
      messageDelete: {
        d: true,
        msg: '',
        c: 'f',
      },
      messageReactionAdd: {
        d: true,
        msg: '',
        c: 'f',
      },
      messageReactionRemove: {
        d: true,
        msg: '',
        c: 'f',
      },
      messageUpdate: {
        d: true,
        msg: '',
        c: 'f',
      },
    },
  };
  return put(id, deflateObj(obj));
};

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
