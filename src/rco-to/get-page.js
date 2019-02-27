const fs                   = require('fs');
const path                 = require('path');
const req                  = require('request-promise');
const cheerio              = require('cheerio');

const l                    = require('../util/log');
const generateSequenceName = require('../util/generate-sequence-name');

module.exports = (imgUrl, imgDestDir, options, config) => {
  const genName = generateSequenceName(imgUrl, config, true);
  const imgFinalName = `${imgDestDir}/${genName}`;

  return req.get({
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
};
