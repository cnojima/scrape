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
      
      $(`select.hidden-xs option`).each((i, opt) => {
        const v = $(opt).attr('value');

        if (v.indexOf('all-pages') < 0) {
          ret.push(v);
        }
      });

      return ret;
    })

    .catch(err => {
      l.error(err);
      process.exit(1);
    });
}