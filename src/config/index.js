process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const path    = require('path');
const dirs    = require('./directories');
const logging = require('./logger');

let config = {
  // EXTRA debug logging, slow as hell.
  debugMode        : false,

  // STDOUT debug output on fetch/request calls
  debugRequest     : false,

  // use the site-specific getPage controller
  useCustomGetPage : false,

  // use the site-specific getCollection controller
  useCustomGetCollection: false,

  // remove source files after CBZ creations
  nukeSource       : true,

  // throttled number of simultaneous requests
  throttled        : 20,

  // request/request-promise timeout in ms
  reqTimeout       : 15000,

  // skip 'omake' chapters
  skipOmake        : true,

  // padding length in chapter names
  chapterPadLength : 3,

  // padding length in image names
  imgPadLength     : 3,

  // querySelector for <img />
  imgSelector      : '',

  // collectionSelector for lists of pages
  collectionSelector : {
    attribute: '',
    selector: '',
  },
};

config = { ...config, ...dirs, ...logging };

module.exports = config;
