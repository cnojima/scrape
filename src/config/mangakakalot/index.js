const config = require('../');

module.exports = {
  ...config,

  logLevel: 'DEBUG',

  // outDir: `/Volumes/cbr/Manga`,
  outDir: `${process.cwd()}/out`,

  // img selector
  imgSelector: 'div#vungdoc img',

  useCustomGetPage: true,
};
