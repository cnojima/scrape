/**
  process.env.LOG_LEVEL = ERROR | QUIET | WARN | LOG | INFO | DEBUG
 */

module.exports = {
  // logger (console) verbosity
  logLevel: 'LOG',

  // number of zip archive of each type of log to keep
  keepLogs: 5,

  // logFile max size in MB
  maxSize: 5,
};
