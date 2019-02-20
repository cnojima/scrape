const req     = require('request-promise');
const cheerio = require('cheerio');
const l       = require('../util/log');
const config  = require('../config/mangakakalot');

module.exports = (chapterUrl, options) => {
  return req({
    url: chapterUrl,
    transform: body => cheerio.load(body)
  })
    .then($ => {
      const ret = [];
      
      $(config.imgSelector).each((i, opt) => {
        ret.push($(opt).attr('src'));
      });
      
      return ret;
    })

    .catch(err => {
      l.error(err);
      process.exit(1);
    });
}
