const req     = require('request-promise');
const cheerio = require('cheerio');
const l       = require('../util/log');

/**
 * Retrieves a list of chapters, issues, volumes from a site given a query selector
 * If the operation fails, the `config.redo` flag will be set to true and execution will continue.
 *
 * Site-specific to mangareader as the URIs are relative to the domain.
 *
 * @param {!object} options Options from CLI arguments
 * @param {!object} config Configuration for the supported site.
 * @return {Promise}
 */
module.exports = (options) => {
  return req({
    url: options.url,
    transform: body => cheerio.load(body)
  }).then($ => {
    const ret = [];
    $(`table#listing a`).each((i, a) => {
      ret.push(`https://www.mangareader.net${$(a).attr('href')}`);
    });
    return ret;
  }).catch(err => {
    l.error(err);
    process.exit(1);
  });
}
