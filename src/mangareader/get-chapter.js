const req     = require('request-promise');
const cheerio = require('cheerio');
const l       = require('../util/log');

module.exports = (chapterUrl, options) => {
  return req({
    url: chapterUrl,
    transform: body => cheerio.load(body)
  })
    .then($ => {
      const ret = [];
      
      $(`select#pageMenu option`).each((i, opt) => {
        ret.push(`https://www.mangareader.net${$(opt).attr('value')}`);
      });
      
      return ret;
    })

    .catch(err => {
      l.error(err);
      process.exit(1);
    });
}