const fs                   = require('fs');
const path                 = require('path');
const req                  = require('request-promise');
const cheerio              = require('cheerio');

const l                    = require('../util/log');

module.exports = (imgUrl, pageNumber, imgDestDir, options, config) => {
  const imgFinalName = `${imgDestDir}/${pageNumber}`;

  return req.get({
    method: 'GET',
    encoding: null,
    timeout: config.reqTimeout,
    resolveWithFullResponse: true,
    url : imgUrl
  }).then(function (res) {
    // console.log(res.headers);process.exit();
    let ext = path.extname(imgUrl);

    if (!ext) {
      ext = `.${path.basename(res.headers['content-type'])}`;
    }

    l.info(`saving ${imgFinalName}${ext}`);
    const buffer = Buffer.from(res.body, 'utf8');
    fs.writeFileSync(`${imgFinalName}${ext}`, buffer);
  }).catch(err => {
    config.redo = true;
    l.error(`error in downloading img ${err}`);
    // throw `wtf: ${imgUrl}`;
  });
};
