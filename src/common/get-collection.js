const req     = require('request-promise');
const cheerio = require('cheerio');
const history = require('../util/history');
const l       = require('../util/log');


/**
 * Retrieves a list of chapters, issues, volumes from a site given a query selector
 * If the operation fails, the `config.redo` flag will be set to true and execution will continue.
 *
 * @param {!object} options Options from CLI arguments
 * @param {!object} config Configuration for the supported site.
 * @return {Promise}
 */
module.exports = (options, config) => {
  return req({
    url: options.url,
    transform: body => cheerio.load(body)
  }).then($ => {
    const ret = [];
    const { selector, attribute } = config.collectionSelector;

    // check for completion
    if (config.completedSelector && $(config.completedSelector).text().toLowerCase().indexOf('complete') > -1) {
      options['is-complete'] = true;
      history(options, config);
    }

    $(selector).each((i, a) => {
      const url = $(a).attr(attribute);

      if (ret.indexOf(url) < 0) {
        ret.push(url);
      }
    });

    return ret;
  }).catch(err => {
    config.redo = true;
    l.error(err);
  });
}
