const req = require('request-promise');
const cheerio = require('cheerio');
const l = require('../util/log');

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

    $('select[name="page"] option').each((i, opt) => {
      const v = $(opt).attr('value');

      if (ret.indexOf(v) < 0) {
        ret.push(v);
      }
    });

    return ret;
  })

  .catch((err) => {
    l.error(err);
    process.exit(1);
  });
