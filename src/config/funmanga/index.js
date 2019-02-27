/**
 * CONFIG FOR
 * https://www.funmanga.com 
 */
const config = require('../');

module.exports = {
  ...config,
  
  name: 'funmanga',

  // logLevel: 'INFO',

  outDir: `/Volumes/cbr/Manga`,

  // remove source files after CBZ creations
  nukeSource       : true,

  // padding length in chapter names
  chapterPadLength : 4,

  // img selector
  imgSelector: 'img#chapter_img.img-responsive',

  // collectionSelector for lists of pages
  collectionSelector : {
    attribute: 'href',
    selector: 'ul.chapter-list a',
  },
};
