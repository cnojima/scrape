process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const path    = require('path');
const dirs    = require('./directories');
const logging = require('./logger');

let config = {
  // EXTRA debug logging, slow as hell.
  debugMode    : false,

  // STDOUT debug output on fetch/request calls
  debugRequest : false,
};

config = { ...config, ...dirs, ...logging };

module.exports = config;
