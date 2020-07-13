exports.log = function log(message) {
  var date = new Date();
  console.log(`[${date.getFullYear()}/${date.getDate()}/${(date.getMonth() + 1)}-` +
  `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}][LOG]${message}`);
};

exports.warning = function warning(message) {
  var date = new Date();
  console.error(`[${date.getFullYear()}/${date.getDate()}/${(date.getMonth() + 1)}-` +
  `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}][WARNING]${message}`);
};

exports.error = function error(message, err) {
  var date = new Date();
  console.error(`[${date.getFullYear()}/${date.getDate()}/${(date.getMonth() + 1)}-` +
  `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}][ERROR]${message}`);
  if (err) {
    console.error(err);
  }
  console.error('Exiting.');
  process.exit(-1);
};