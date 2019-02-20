const config = require('../');

module.exports = {
  ...config,
  
  logLevel: 'DEBUG',

  // outDir: `/Volumes/cbr/Manga`,

  // img selector
  imgSelector: 'img#chapter_img.img-responsive',

  // remove source files after CBZ creations
  nukeSource       : true,

  // padding length in chapter names
  chapterPadLength : 4,
};
