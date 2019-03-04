const path = require('path');

const configDir = path.resolve(__dirname);
const logDir = path.resolve(__dirname, '../../logs');
const outDir = path.resolve(__dirname, '../../out');

module.exports = {
  configDir,
  logDir,
  outDir,
};
