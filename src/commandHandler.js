let commands = {};

exports.endpoint = function endpoint (match, handler) {
  commands[match] = handler;
};

exports.apply = function apply (command, context) {
  let keys = Object.keys(commands);
  for (let i = 0; i < keys.length; i++) {
    let match = command.match(keys[i]);
    if (match) {
      commands[keys[i]](match, context);
      return true;
    }
  }
  return false;
};
