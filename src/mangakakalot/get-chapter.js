const req = require('request-promise');
const cheerio = require('cheerio');
const l = require('../util/log');
const config = require('../config/mangakakalot');

/**
 * Site-specific fetch for pages in a given chapter
 *
 * @param {!string} chapterUrl URL to the TOC page of a given collection
 * @return {promise}
 */
module.exports = chapterUrl => req({
  url: chapterUrl,
  transform: body => cheerio.load(body),
})
  .then(($) => {
    const ret = [];

    $(config.imgSelector).each((i, opt) => {
      ret.push($(opt).attr('src'));
    });

    return ret;
  })

  .catch((err) => {
    l.error(err);
    process.exit(1);
  });
