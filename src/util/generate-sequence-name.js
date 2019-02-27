const path = require('path');

/**
 * Generates a sequence name based on the site's configuration of `imgPadLength` - default is 3.
 * e.g.:
 *    chapter_98 => 098
 *    p000001.png => 001.png
 *
 * @param {!string} url Full url to remote page or image asset
 * @param {!object} config Configuration for the supported site.
 * @param {?boolean} isImage Flag to determine if the URI is for an image resource
 * @param {?boolean} appendExtension (default: true) Flag to append the detected extension
 * @return {string}
 */
module.exports = (url, config, isImage, appendExtension = true) => {
  const padLen = (isImage) ? config.imgPadLength : config.chapterPadLength
  const ext = path.extname(url);
  const img = path.basename(url, ext).replace(/[^0-9\.]/g, '');
  const finalName = (img.length > padLen) ? img.substr(img.length - padLen) : img.padStart(padLen, '0');

  // console.log(url.cyan, finalName.green);
  return `${finalName.padStart(config.imgPadLength, '0')}${(appendExtension) ? ext : ''}`.trim();
};
