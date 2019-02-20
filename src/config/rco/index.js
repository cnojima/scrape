/**
 * CONFIG FOR
 * https://readcomicsonline.ru
 */
const config = require('../');

module.exports = {
  ...config,

  // outDir: `/Volumes/cbr/Western`,

  logLevel: 'DEBUG',

  imgSelector: 'img.img-responsive.scan-page',

  // collectionSelector for lists of pages
  collectionSelector : {
    attribute: 'href',
    selector: 'ul.chapters li a',
  },
};
