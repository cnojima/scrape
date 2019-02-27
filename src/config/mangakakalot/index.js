/**
 * CONFIG FOR
 * https://mangakakalot.com
 */
const config = require('../');

module.exports = {
  ...config,

  name: 'mangakakalot',

  // logLevel: 'DEBUG',

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
