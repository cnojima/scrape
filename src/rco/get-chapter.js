const req     = require('request-promise');
const cheerio = require('cheerio');
const l       = require('../util/log');

/**
 * Site-specific fetch for pages in a given chapter
 *
 * @param {!string} chapterUrl URL to the TOC page of a given collection
 * @param {!object} config Configuration for the supported site.
 * @return {promise}
 */
module.exports = (chapterUrl, options) => {
  return req({
    url: chapterUrl,
    transform: body => cheerio.load(body)
  })
    .then($ => {
      const ret = [];

      $(`select.selectpicker option`).each((i, opt) => {
        const pageNum = $(opt).attr('value');
        const url = `${chapterUrl}/${pageNum}`;

        if (pageNum > 0 && ret.indexOf(url) < 0) {
          ret.push(url);
        }
      });

      return ret;
    })

    .catch(err => {
      global.errors = true;
      l.error(err);
      process.exit(1);
    });
}
