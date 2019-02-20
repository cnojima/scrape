const req     = require('request-promise');
const cheerio = require('cheerio');
const l       = require('../util/log');


module.exports = (options, config) => {
  return req({
    url: options.url,
    transform: body => cheerio.load(body)
  }).then($ => {
    const ret = [];
    const { selector, attribute } = config.collectionSelector;

    $(selector).each((i, a) => {
      const url = $(a).attr(attribute);

      if (ret.indexOf(url) < 0) {
        ret.push(url);
      }
    });

    return ret;
  }).catch(err => {
    l.error(err);
    process.exit(1);
  });
}
