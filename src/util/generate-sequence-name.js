const path = require('path');
const urln = require('url');
const Case = require('case');

/**
 * Generates a sequence name based on the site's configuration of `imgPadLength` - default is 3.
 * e.g.:
 *    chapter_98 => 098
 *    p000001.png => 001.png
 *
 * @param {!string} rawUrl Typically a url to remote page or image asset,
                           but can be an arbitrary string.
 * @param {!object} config Configuration for the supported site.
 * @param {?boolean} isImage (default: false) Flag to determine if the URI is for an image resource
 * @param {?boolean} appendExtension (default: true) Flag to append the detected extension
 * @return {string}
 */
module.exports = (rawUrl, config, isImage = false, appendExtension = true) => {
  const padLen = (isImage) ? config.imgPadLength : config.chapterPadLength;
  let url = rawUrl;

  if (rawUrl.indexOf('http') > -1) {
    const Url = new URL(rawUrl);
    url = path.basename(
      urln.format(Url, {
        fragment: false, unicode: true, auth: false, search: false,
      }),
    );
  }
  const ext = path.extname(url);
  const img = path.basename(url, ext).replace(/[^0-9.]/g, '');
  const finalName = (img.length > padLen) ? img.substr(img.length - padLen) : img.padStart(padLen, '0');

  // if dealing with a book/chapter title that is a trade paperback
  if (isImage === false && rawUrl.indexOf('TPB') > -1) {
    return Case.title(url);
  }

  // console.log(url.cyan, finalName.green);
  return `${finalName.padStart(config.imgPadLength, '0')}${(appendExtension) ? ext : ''}`.trim();
};
