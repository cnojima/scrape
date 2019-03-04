const fs      = require('fs');
const path    = require('path');
const req     = require('request-promise');
const cheerio = require('cheerio');

const config  = require('../config/mangakakalot');
const l       = require('../util/log');
const generateImgName = require('../util/generate-sequence-name');

/**
 * Mangakakalot image fetch as the img `src` is available from the TOC
 *
 * @param {!string} imgUrl URL to the image in a given page
 * @param {!string} imgDestDir Full path to the chapter directory to save image
 * @param {!object} options Options from CLI arguments
 * @return {promise}
 */
module.exports = (imgUrl, imgDestDir, options) => {
  l.debug(`GET'ing ${imgUrl}`);

  return req.get({
    method: 'GET',
    encoding: null,
    timeout: config.reqTimeout,
    url : imgUrl
  }).then(function (res) {
    const genName = generateImgName(`${imgUrl}`, config);
    const imgFinalName = `${imgDestDir}/${genName}`;

    l.debug(`saving ${imgFinalName}`);
    const buffer = Buffer.from(res, 'utf8');

    try {
      fs.writeFileSync(imgFinalName, buffer);
    } catch (err) {

      global.errors = true;
      config.redo = true;
      l.error(`error in downloading img [mangakakalot] : ${err}`);

      if (fs.existsSync(imgFinalName)) {
        l.warn(`deleting errored image asset [ ${imgFinalName} ]`);
        l.warn(`origin URL [ ${imgUrl} ]`);
        fs.unlinkSync(imgFinalName);
      }

    }
  }).catch(err => {
    global.errors = true;
    config.redo = true;
    l.error(`error in downloading img [mangakakalot] : ${err}`);

    if (fs.existsSync(imgFinalName)) {
      l.warn(`deleting errored image asset [ ${imgFinalName} ]`);
      fs.unlinkSync(imgFinalName);
    }
  });
}
