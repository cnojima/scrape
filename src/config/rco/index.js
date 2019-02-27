/**
 * CONFIG FOR
 * https://readcomicsonline.ru
 */
const config = require('../');

module.exports = {
  ...config,

  name        : 'rco',

  throttled   : 5,

  // pause before performing file-count sanity check in ms
  pauseBeforeSanity : 10000,

  outDir      : `/Volumes/cbr/Western`,

  // logLevel    : 'DEBUG',

  completedSelector: 'span.label-danger',

  imgSelector : 'img.img-responsive.scan-page',

  // collectionSelector for lists of pages
  collectionSelector : {
    attribute: 'href',
    selector: 'ul.chapters li a',
  },
};
