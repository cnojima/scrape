/**
  process.env.LOG_LEVEL = ERROR | QUIET | WARN | LOG | INFO | DEBUG
 */

let currentLevel = process.env.LOG_LEVEL || 'LOG';

const fs           = require('fs');
const mkdirp       = require('mkdirp');
const DEBUG_LOG    = require('../config/logger').DEBUG_LOG;
const ERROR_LOG    = require('../config/logger').ERROR_LOG;
const INFO_LOG     = require('../config/logger').INFO_LOG;
const WARN_LOG     = require('../config/logger').WARN_LOG;
const levelMap = {};
const levels = {
  ERROR : 0,
  QUIET : 1,
  WARN  : 2,
  LOG   : 3,
  INFO  : 5,
  DEBUG : 8
};

let STANDARD_LOG = require('../config/logger').STANDARD_LOG;


/**
 * set a custom log name
 * @param {!String} destFile
 */
function setLogName(destFile) {
  console.log(`setting log name to [ ${destFile} ]`.white);
  STANDARD_LOG = destFile;
}

/**
 * set log level
 * @param {!String} LOG_LEVEL
 */
function setLogLevel(LOG_LEVEL) {
  console.log(`setting LOG_LEVEL to ${LOG_LEVEL}`.white)
  currentLevel = levels[LOG_LEVEL];
}


/**
 * pad zero strings for timestamp
 * @param {String} s
 * @return {string}
 */
function padZero(s) {
  s = (typeof s === 'string') ? s : new String(s);
  s = '00'.slice(s.length) + s;

  return s;
}


const maxLen = 13;

function padLeft(s, len) {
  len = len || 7;
  const pad = [];

  len += Math.round(s.length / 2);

  for(let i=0; i<len; i++) {
    pad.push(' ');
  }

  return `${pad.join('').slice(s.length)}${s}`;
}

function padRight(s) {
  return s.padEnd(maxLen, ' ');
}


/**
 * decorate the timestamp
 * @param {String} s
 * @return {string}
 */
function decorateTimeStamp(s) {
  const d = new Date();

  return [
    '[',
      d.getFullYear(), '-', padZero(d.getMonth() + 1), '-', padZero(d.getDate()), ' ',
      padZero(d.getHours()), ':', padZero(d.getMinutes()), ':', padZero(d.getSeconds()),
    ']',
    s
  ].join('');
}


/**
 * write the log file
 * @param {String} log logfile
 * @param {String} s
 */
function writeLog(log, s) {
  s = decorateTimeStamp(s);
  s += '\n';

  const dir = log.slice(0, log.lastIndexOf('/') + 1);

  if (!fs.existsSync(dir)) {
    mkdirp.sync(dir);
  }

  fs.appendFile(log, s.strip, () => null);
}

/**
 * outputs log lines to console
 * @param {String} s
 * @param {Integer} logLevel
 */
function stdout(s, logLevel) {
  currentLevel = currentLevel || levels[process.env.LOG_LEVEL];

  s = decorateTimeStamp(s);
  s.replace(/\n/, '');

  if (currentLevel >= logLevel) {
    switch (logLevel) {
      case levels.ERROR:
        console.log(s.red);
        break;

      case levels.WARN:
        console.log(s.yellow);
        break;

      case levels.LOG:
        console.log(s.grey);
        break;

      case levels.INFO:
        console.log(s.white);
        break;

      case levels.DEBUG:
        console.log(s.grey.dim);
        break;
    }
  }
}



/**
 * STD level log
 * @param {!string} s
 */
function log(s) {
  s = '[STDO] ' + s;
  writeLog(STANDARD_LOG, s);
  stdout(s, levels.LOG);
}

/**
 * INF level log
 * @param {!string} s
 */
function info(s) {
  s = '[INFO] ' + s;
  writeLog(STANDARD_LOG, s);
  stdout(s, levels.INFO);
}

/**
 * ERR level log
 * @param {!string} s
 */
function error(s) {
  s = '[ERRO] ' + s;
  writeLog(STANDARD_LOG, s);
  stdout(s, levels.ERROR);
}

/**
 * WRN level log
 * @param {!string} s
 */
function warn(s) {
  s = '[WARN] ' + s;
  writeLog(STANDARD_LOG, s);
  stdout(s, levels.WARN);
}

/**
 * DBG level log
 * @param {!string} s
 */
function debug(s) {
  s = '[DBUG] ' + s;
  writeLog(STANDARD_LOG, s);
  stdout(s, levels.DEBUG);
}

module.exports = {
  setLogLevel,
  setLogName,
  std   : log,
  log   : log,
  info  : info,
  warn  : warn,
  error : error,
  debug : debug
};
