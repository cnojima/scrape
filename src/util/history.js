const fs          = require('fs');
const l           = require('./log');
const historyFile = `${process.cwd()}/out/history.json`;

/**
 * Archives config and options used at time of scrape for updates.
 * @param {!object} options Full options from CLI and defaults
 * @param {!object} config Full site-based config with overrides used during scrape.
 */
module.exports = (options, config) => {
  let history = {};

  if (fs.existsSync(historyFile)) {
    history = require(historyFile);
  }

  if (history[options.url]) {
    l.warn(`repeat scrape of [ ${options.url} ]`);
  }

  history[options.url] = {
    options,
    config
  };

  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2), 'utf8');
}
