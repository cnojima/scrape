/**
 * CONFIG FOR
 * https://readcomicsonline.ru
 */
const config = require('../');

module.exports = {
  ...config,

  name        : 'rco',

  throttled   : 5,

  outDir      : `/Volumes/cbr/Western`,

  logLevel    : 'DEBUG',

  imgSelector : 'img.img-responsive.scan-page',

  // collectionSelector for lists of pages
  collectionSelector : {
    attribute: 'href',
    selector: 'ul.chapters li a',
  },
};
