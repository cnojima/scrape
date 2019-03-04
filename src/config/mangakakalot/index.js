const config = require('../');
/**
 * CONFIG FOR
 * https://mangakakalot.com
 */
module.exports = {
  ...config,

  name: 'mangakakalot',

  // throttled number of simultaneous requests
  throttled        : 10,

  // padding length in chapter names
  chapterPadLength : 4,

  // padding length in image names
  imgPadLength     : 4,

  outDir: `/Volumes/cbr/Manga`,

  // img selector
  imgSelector: 'div#vungdoc img',

  // collectionSelector for lists of pages
  collectionSelector : {
    attribute: 'href',
    selector: 'div.chapter-list div.row a',
  },

  useCustomGetPage: true,
};
