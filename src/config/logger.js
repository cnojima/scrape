const path   = require('path');
const config = require('./directories');

module.exports = {
  // logger (console) verbosity
  logLevel     : 'INFO',

  // number of zip archive of each type of log to keep
  keepLogs     : 5,

  // logFile max size in MB
  maxSize      : 5,
  ERROR_LOG    : path.resolve(config.logDir, 'error.log'),
  WARN_LOG     : path.resolve(config.logDir, 'warn.log'),
  STANDARD_LOG : path.resolve(config.logDir, 'std.log'),
  INFO_LOG     : path.resolve(config.logDir, 'info.log'),
  DEBUG_LOG    : path.resolve(config.logDir, 'debug.log')
};
