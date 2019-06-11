const fs = require('fs');
const path = require('path');
const req = require('request-promise');
const cheerio = require('cheerio');

const l = require('../util/log');
const generateSequenceName = require('../util/generate-sequence-name');


/**
 * Expects a URL to a page represent one page in a volume.
 * Using the `imgSelector` from the site configuration, a second URL is found.
 * With the URI to the image resource itself, finally the image is downloaded
 * and saved to the target directory.
 *
 * @param {!String} pageUrl Page to scrape
 * @param {!String} imgDestDir Full path to the directory to save the image
 * @param {!object} options Options from CLI arguments
 * @param {!object} config Configuration for the supported site.
 * @return {Promise}
 */
module.exports = (pageUrl, imgDestDir, options, config) => {
  // go to HTML page
  l.debug(`@getPage going to [ ${pageUrl} ] for [ ${imgDestDir} ]`.cyan);

  return req({
    url: pageUrl,
    timeout: config.reqTimeout,
    transform: body => cheerio.load(body),
  })

    .then($ => $(config.imgSelector).attr('src'))

    .then((imgUrl) => {
      const ext = path.extname(imgUrl);
      const genName = generateSequenceName(`${pageUrl}${ext}`, config);
      const imgFinalName = `${imgDestDir}/${genName}`;

      l.debug(`GET'ing ${imgUrl}`);

      return req.get({
        method: 'GET',
        encoding: null,
        timeout: config.reqTimeout,
        url: imgUrl,
      }).then((res) => {
        l.info(`saving ${imgFinalName}`);
        const buffer = Buffer.from(res, 'utf8');

        try {
          fs.writeFileSync(imgFinalName, buffer);
        } catch (err) {
          global.errors = true;
          config.redo = true;
          l.warn(`@getPage fs.writeFileSync failed for ${imgFinalName} with ${err} - trying again`);

          setTimeout(() => {
            try {
              fs.writeFileSync(imgFinalName, buffer);
            } catch (err2) {
              l.error(`2nd attempt at fs.writeFileSync failed for ${imgFinalName}.  failing this image save.`);
            }
          }, 100);
        }
      }).catch((err) => {
        global.errors = true;
        config.redo = true;
        l.error(`error in downloading img ${err}`);

        if (fs.existsSync(imgFinalName)) {
          l.warn(`deleting errored image asset [ ${imgFinalName} ]`);
          l.warn(`origin URL [ ${imgUrl} ]`);
          fs.unlinkSync(imgFinalName);
        }
      });
    })

    .catch((err) => {
      global.errors = true;
      config.redo = true;
      l.error(err);
    });
};
