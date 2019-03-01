/**
 * CONFIG FOR
 * https://readcomiconline.to
 */
const config = require('../');

module.exports = {
  ...config,

  name        : 'rco-to',

  throttled   : 5,

  // pause before performing file-count sanity check in ms
  pauseBeforeSanity : 10000,

  nukeSource : true,

  outDir      : `/Volumes/cbr/Western`,

  // logLevel    : 'DEBUG',

  completedSelector: '#leftside .barContent p',

  imgSelector : '#containerRoot p img',

  // collectionSelector for lists of pages
  collectionSelector : {
    attribute: 'href',
    selector: 'div.episodeList .listing a',
  },
};
