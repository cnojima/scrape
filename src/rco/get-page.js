const fs      = require('fs');
const path    = require('path');
const req     = require('request-promise');
const cheerio = require('cheerio');
const l       = require('../util/log');

module.exports = (pageUrl, imgDest, options) => {
  return req({
    url: pageUrl,
    transform: body => cheerio.load(body)
  })
    .then($ => {
      return $('img.img-responsive.scan-page').attr('src');
    })

    .then(imgUrl => {
      l.info(`GET'ing ${imgUrl}`);

      req.get({
        method: 'GET',
        encoding: null,
        url : imgUrl
      }).then(function (res) {
        l.debug(`saving ${imgDest}`);
        const buffer = Buffer.from(res, 'utf8');
        fs.writeFileSync(`${imgDest}`, buffer);
      }).catch(err => {
        l.error(`error in downloading img ${err}`);
        throw `wtf: ${imgUrl}`;
      });
    })

    .catch(err => {
      l.error(err);
      process.exit(1);
    });
}