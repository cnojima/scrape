process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const path      = require('path');
const dirs      = require('./directories');

let config = {
  // EXTRA debug logging, slow as hell.
  debugMode         : false,

  // STDOUT debug output on fetch/request calls
  debugRequest      : false,

  // throttled number of simultaneous requests
  throttled         : 25,

  // use ENV proxy settings, `true` for no proxy
  noProxy           : false,
};

config = { ...config, ...dirs };

module.exports = config;
