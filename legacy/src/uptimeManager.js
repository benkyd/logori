const fs = require('fs');

const uptimeInfoFile = './uptime.json';

exports.startTime = new Date();

exports.uptimeInfo = {};

exports.loadUptime = function loadUptime () {
  if (fs.existsSync(uptimeInfoFile)) {
    exports.uptimeInfo = JSON.parse(fs.readFileSync(uptimeInfoFile));
  }
}

exports.thingsDoTo = function thingsToDo () {
  let t = new Date();
  if (!fs.existsSync(uptimeInfoFile)) {
    exports.uptimeInfo.firstLaunch = exports.startTime.getTime();
    exports.uptimeInfo.runningTime = t.getTime() - exports.startTime.getTime();
    fs.writeFileSync(uptimeInfoFile, JSON.stringify(exports.uptimeInfo));
  }
  else {
    exports.uptimeInfo.runningTime = exports.uptimeInfo.runningTime + (t.getTime() - exports.startTime.getTime());
    fs.writeFileSync(uptimeInfoFile, JSON.stringify(exports.uptimeInfo));
  }
};