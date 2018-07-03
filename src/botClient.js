const Eris = require('eris');
const configM = require('./configManager');
exports.bot = new Eris(configM.config.token, {
  disableEvents: {
    "PRESENCE_UPDATE": true,
    "VOICE_STATE_UPDATE": true,
    "MESSAGE_DELETE_BULK": true,
    "TYPING_START": true,
  },
  compress: true,
  disableEveryone: false,
});