const fs = require('fs');
const req = require('request-promise');

const config = require('../config/mangakakalot');
const l = require('../util/log');
const generateImgName = require('../util/generate-sequence-name');

/**
 * Mangakakalot image fetch as the img `src` is available from the TOC
 *
 * @param {!string} imgUrl URL to the image in a given page
 * @param {!string} imgDestDir Full path to the chapter directory to save image
 * @return {promise}
 */
module.exports = (imgUrl, imgDestDir) => {
  l.debug(`GET'ing ${imgUrl}`);
  let imgFinalName;

  return req.get({
    method: 'GET',
    encoding: null,
    timeout: config.reqTimeout,
    url: imgUrl,
  }).then((res) => {
    const genName = generateImgName(`${imgUrl}`, config);
    imgFinalName = `${imgDestDir}/${genName}`;

    l.debug(`saving ${imgFinalName}`);
    const buffer = Buffer.from(res, 'utf8');

    try {
      fs.writeFileSync(imgFinalName, buffer);
    } catch (err) {
      global.errors = true;
      config.redo = true;

      l.error(`error in downloading img [mangakakalot] : ${err} - trying again`);

      setTimeout(() => {
        try {
          fs.writeFileSync(imgFinalName, buffer);
        } catch (err2) {
          l.error('2nd attempt at fs.writeFileSync failed.  failing this image save.');
        }
      }, 100);
    }
  }).catch((err) => {
    global.errors = true;
    config.redo = true;
    l.error(`error in downloading img [mangakakalot] : ${err}`);

    if (fs.existsSync(imgFinalName)) {
      l.warn(`deleting errored image asset [ ${imgFinalName} ]`);
      fs.unlinkSync(imgFinalName);
    }
  });
};
