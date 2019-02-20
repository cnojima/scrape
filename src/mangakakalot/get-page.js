const fs      = require('fs');
const path    = require('path');
const req     = require('request-promise');
const cheerio = require('cheerio');

const config  = require('../config/mangakakalot');
const l       = require('../util/log');
const generateImgName = require('../util/generate-sequence-name');

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
    fs.writeFileSync(imgFinalName, buffer);
  }).catch(err => {
    l.error(`error in downloading img ${err}`);
    // throw `wtf: ${imgUrl}`;
  });
}
