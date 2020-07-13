const levelup = require('levelup');
const leveldown = require('leveldown');
const zlib = require('zlib');

let db = levelup(leveldown('./logoriDB')); // Make that path customizable

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
    return text;
}

db.createReadStream()
  .on('data', async (data) => {
    console.log(Buffer(data.key, 'base64').toString(), " = ", await get(Buffer(data.key, 'base64').toString()));
});
