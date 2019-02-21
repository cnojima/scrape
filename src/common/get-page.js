const fs                   = require('fs');
const path                 = require('path');
const req                  = require('request-promise');
const cheerio              = require('cheerio');

const l                    = require('../util/log');
const generateSequenceName = require('../util/generate-sequence-name');


/**
 * @return {Promise}
 */
module.exports = (pageUrl, imgDestDir, options, config) => {
  // go to HTML page
  l.debug(`@getPage going to [ ${pageUrl} ] for [ ${imgDestDir} ]`.cyan)

  return req({
    url: pageUrl,
    timeout: config.reqTimeout,
    transform: body => cheerio.load(body)
  })

    .then($ => $(config.imgSelector).attr('src'))

    .then(imgUrl => {
      const ext = path.extname(imgUrl);
      const genName = generateSequenceName(`${pageUrl}${ext}`, config);
      const imgFinalName = `${imgDestDir}/${genName}`;

      l.debug(`GET'ing ${imgUrl}`);

      req.get({
        method: 'GET',
        encoding: null,
        timeout: config.reqTimeout,
        url : imgUrl
      }).then(function (res) {
        l.info(`saving ${imgFinalName}`);
        const buffer = Buffer.from(res, 'utf8');
        fs.writeFileSync(`${imgFinalName}`, buffer);
      }).catch(err => {
        config.redo = true;
        l.error(`error in downloading img ${err}`);
        // throw `wtf: ${imgUrl}`;
      });
    })

    .catch(err => {
      config.redo = true;
      l.error(err);
    });
}
