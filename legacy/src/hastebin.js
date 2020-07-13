const snekfetch = require('snekfetch');

module.exports = async function hastebin(hastebin, msg) {
  try {
    let res = await snekfetch.post(hastebin + '/documents').send(msg);
    if (res.body.key) {
      return `${hastebin}/${res.body.key}`;
    }
    else {
      return '';
    }
  }
  catch (e) {
    return '';
  }
}