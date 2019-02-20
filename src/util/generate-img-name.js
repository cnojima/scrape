const path = require('path');

module.exports = (url, config) => {
  const ext = path.extname(url);
  const img = path.basename(url, ext)
  const finalName = (img.length > 3) ? img.substr(img.length - 3) : img;

  // console.log(url.cyan, finalName.green);

  return `${finalName.padStart(config.imgPadLength, '0')}${ext}`;
};