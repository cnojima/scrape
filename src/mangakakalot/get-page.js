const fs      = require('fs');
const path    = require('path');
const req     = require('request-promise');
const cheerio = require('cheerio');
const l       = require('../util/log');

module.exports = (imgUrl, imgDest, options) => {
  if (!fs.existsSync(imgDest)) {
    l.debug(`GET'ing ${imgUrl}`);

    return req.get({
      method: 'GET',
      encoding: null,
      url : imgUrl
    }).then(function (res) {
      l.debug(`saving ${imgDest}`);
      const buffer = Buffer.from(res, 'utf8');
      fs.writeFileSync(imgDest, buffer);
    }).catch(err => {
      l.error(`error in downloading img ${err}`);
      throw `wtf: ${imgUrl}`;
    });
  } else {
    l.info(`${imgDest} exists - skipping`);
  }
}