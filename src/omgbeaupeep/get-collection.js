const l = require('../util/log');
const getColl = require('../common/get-collection');

/**
 * Retrieves a list of chapters, issues, volumes from a site given a query selector
 * If the operation fails, the `config.redo` flag will be set to true and execution will continue.
 *
 * Site-specific to omgbeaupeep as the URIs are relative to the domain.
 *
 * @param {!object} options Options from CLI arguments
 * @param {!object} config Configuration for the supported site.
 * @return {Promise} resolved array of URLs to a chapter
 */
module.exports = async (options, config) => {
  const ret = [];
  const chapters = await getColl(options, config);

  if (chapters.length > 0) {
    chapters.forEach((c) => {
      const fullUrl = `${options.url}/${c}`;
      if (ret.indexOf(fullUrl) < 0) {
        ret.push(fullUrl);
      }
    });

    // this site hosts only completed series
    options['is-completed'] = true;
  }

  l.log(`${options.name} has ${ret.length} issues`);

  return ret;
};
