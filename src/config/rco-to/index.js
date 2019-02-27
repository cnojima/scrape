/**
 * CONFIG FOR
 * https://readcomicsonline.ru
 */
const config = require('../');

module.exports = {
  ...config,

  name        : 'rco-to',

  throttled   : 5,

  // pause before performing file-count sanity check in ms
  pauseBeforeSanity : 10000,

  outDir      : `/Volumes/cbr/Western`,

  // logLevel    : 'DEBUG',

  imgSelector : '#imgCurrent',

  // collectionSelector for lists of pages
  collectionSelector : {
    attribute: 'href',
    selector: 'div.episodeList .listing a',
  },
};
