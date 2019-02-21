/**
 * CONFIG FOR
 * https://www.mangareader.net
 */
const config = require('../');

module.exports = {
  ...config,

  name: 'mangareader',

  // logLevel: 'DEBUG',

  outDir: `/Volumes/cbr/Manga`,

  // img selector
  imgSelector: 'img#img',

  useCustomGetCollection: true,
};
