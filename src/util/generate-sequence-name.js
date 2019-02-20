const path = require('path');

/**
chapter_98 => 098
p000001.png => 001
*/

module.exports = (url, config, isImage) => {
  const padLen = (isImage) ? config.imgPadLength : config.chapterPadLength
  const ext = path.extname(url);
  const img = path.basename(url, ext).replace(/[^0-9\.]/g, '');
  const finalName = (img.length > padLen) ? img.substr(img.length - padLen) : img.padStart(padLen, '0');

  // console.log(url.cyan, finalName.green);

  return `${finalName.padStart(config.imgPadLength, '0')}${ext}`;
};
