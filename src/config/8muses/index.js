const path = require('path');
const config = require('../');

module.exports = {
  ...config,

  outDir: path.resolve(`/Volumes/p/__8muses`),

  // img selector
  imgSelector: 'img.image',
};
