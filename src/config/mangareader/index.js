/**
 * CONFIG FOR
 * https://www.mangareader.net
 */
const config = require('../');

module.exports = {
  ...config,

  logLevel: 'DEBUG',

  // outDir: `/Volumes/cbr/Manga`,

  // img selector
  imgSelector: 'img#img',

  useCustomGetCollection: true,
};
