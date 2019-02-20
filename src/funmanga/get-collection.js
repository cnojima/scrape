const req     = require('request-promise');
const cheerio = require('cheerio');
const l       = require('../util/log');

module.exports = (options) => {
  return req({
    url: options.url,
    transform: body => cheerio.load(body)
  }).then($ => {
    const ret = [];
    $(`ul.chapter-list a`).each((i, a) => {
      ret.push(`${$(a).attr('href')}`);
    });
    return ret;
  }).catch(err => {
    l.error(err);
    process.exit(1);
  });
}